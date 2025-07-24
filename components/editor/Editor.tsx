'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { TipTapEditor } from './TipTapEditor'
import { useParagraphDebounce } from '@/hooks/useParagraphDebounce'
import { Header } from '@/components/ui'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { anthropicService } from '@/lib/ai/anthropic'
import { SpanIdentification } from '@/lib/ai/types'

interface EditorProps {
  onHighlightsChange: (highlights: any[]) => void
  activeHighlight: string | null
  onHighlightClick: (id: string | null) => void
  highlights: any[]
  onLoadingChange: (loadingParagraphs: Array<{ id: string; content: string }>) => void
  onActiveParagraphChange: (paragraphId: string | null) => void
  onParagraphsChange: (paragraphs: Array<{ id: string; content: string }>) => void
  activeParagraph: string | null
}

export function Editor({ onHighlightsChange, activeHighlight, onHighlightClick, highlights, onLoadingChange, onActiveParagraphChange, onParagraphsChange, activeParagraph }: EditorProps) {
  const [paragraphs, setParagraphs] = useState<Array<{ id: string; content: string }>>([
    { id: '1', content: '' }
  ])
  const [localActiveParagraph, setLocalActiveParagraph] = useState<string>('1')
  const prevActiveParagraphRef = useRef<string | null>(null)

  // Sync external activeParagraph changes with local state
  useEffect(() => {
    if (activeParagraph && activeParagraph !== prevActiveParagraphRef.current) {
      setLocalActiveParagraph(activeParagraph)
      prevActiveParagraphRef.current = activeParagraph
    }
  }, [activeParagraph])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState<Set<string>>(new Set())
  
  // Track last analyzed content for each paragraph to prevent duplicate analysis
  const lastAnalyzedContent = useRef<Record<string, string>>({})
  
  // Track ongoing analysis requests to cancel them if content changes
  const analysisAbortControllers = useRef<Record<string, AbortController>>({})

  const analyzeChangedParagraph = useCallback(async (paragraphId: string) => {
    const paragraph = paragraphs.find(p => p.id === paragraphId)
    if (!paragraph || !paragraph.content.trim()) {
      // Remove highlights for empty paragraphs
      const updatedHighlights = highlights.filter(h => h.paragraphId !== paragraphId)
      onHighlightsChange(updatedHighlights)
      delete lastAnalyzedContent.current[paragraphId] // Clear tracking for empty paragraphs
      return
    }

    // Skip analysis if content hasn't changed since last analysis
    if (lastAnalyzedContent.current[paragraphId] === paragraph.content) {
      return
    }

    // Cancel any ongoing analysis for this paragraph
    if (analysisAbortControllers.current[paragraphId]) {
      analysisAbortControllers.current[paragraphId].abort()
    }

    // Create new abort controller for this analysis
    const abortController = new AbortController()
    analysisAbortControllers.current[paragraphId] = abortController

    // Capture the content at the time analysis starts
    const analysisContent = paragraph.content
    
    // Update service credentials in case they changed
    anthropicService.updateCredentials()
    
    // Add paragraph to analyzing set
    setAnalyzingParagraphs(prev => {
      const newSet = new Set([...prev, paragraphId])
      return newSet
    })
    
    try {
      // Prepare full document context
      const fullDocumentContext = {
        paragraphs: paragraphs,
        targetParagraphId: paragraphId
      }
      
      const response = await anthropicService.identifySpans(analysisContent, fullDocumentContext, abortController.signal)
      
      // Check if the paragraph content has changed since analysis started
      const currentParagraph = paragraphs.find(p => p.id === paragraphId)
      if (!currentParagraph || currentParagraph.content !== analysisContent) {
        return
      }
      
      // Convert spans to highlights with offset adjustment
      const paragraphHighlights = response.spans.map((span: SpanIdentification, idx: number) => ({
        id: `highlight-${paragraph.id}-${idx}`,
        paragraphId: paragraph.id,
        type: span.type,
        priority: span.priority,
        text: span.text.slice(0, 30) + (span.text.length > 30 ? '...' : ''),
        startIndex: Math.max(0, span.startOffset),
        endIndex: Math.min(analysisContent.length, span.endOffset),
        note: span.reasoning,
        confidence: span.confidence,
        fullText: span.text
      }))
      
      // Remove old highlights for this paragraph and add new ones
      const otherHighlights = highlights.filter(h => h.paragraphId !== paragraphId)
      const updatedHighlights = [...otherHighlights, ...paragraphHighlights]
      onHighlightsChange(updatedHighlights)
      
      // Track that we've analyzed this content
      lastAnalyzedContent.current[paragraphId] = analysisContent
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Don't log as error, this is expected
      }
    } finally {
      // Clean up abort controller
      if (analysisAbortControllers.current[paragraphId] === abortController) {
        delete analysisAbortControllers.current[paragraphId]
      }
      
      // Remove paragraph from analyzing set
      setAnalyzingParagraphs(prev => {
        const newSet = new Set(prev)
        newSet.delete(paragraphId)
        return newSet
      })
    }
  }, [paragraphs, highlights, onHighlightsChange])

  // Use per-paragraph debouncing for truly parallel analysis
  useParagraphDebounce(paragraphs, analyzeChangedParagraph, 1000)

  useEffect(() => {
    const analyzingParagraphsWithContent = [...analyzingParagraphs].map(paragraphId => {
      const paragraph = paragraphs.find(p => p.id === paragraphId)
      return {
        id: paragraphId,
        content: paragraph?.content || ''
      }
    })
    onLoadingChange(analyzingParagraphsWithContent)
  }, [analyzingParagraphs, paragraphs, onLoadingChange])

  useEffect(() => {
    onActiveParagraphChange(localActiveParagraph)
  }, [localActiveParagraph, onActiveParagraphChange])

  useEffect(() => {
    onParagraphsChange(paragraphs)
  }, [paragraphs, onParagraphsChange])

  // Sync external paragraph selection changes
  useEffect(() => {
    // When external selection changes, update our local state
    // This will be triggered when sidebar calls onParagraphSelect
  }, [])

  const handleContentChange = useCallback((newParagraphs: Array<{ id: string; content: string }>) => {
    // Check which paragraphs have changed content
    const changedParagraphs = newParagraphs.filter(newP => {
      const oldP = paragraphs.find(p => p.id === newP.id)
      return !oldP || oldP.content !== newP.content
    })
    
    // Check if new paragraphs were created (Enter key pressed)
    const newParagraphsCreated = newParagraphs.filter(newP => !paragraphs.find(p => p.id === newP.id))
    
    // Only update if there are actual changes
    if (changedParagraphs.length === 0 && newParagraphs.length === paragraphs.length) {
      return
    }
    
    // Update paragraphs state
    setParagraphs(newParagraphs)
    
    // If new paragraphs were created (Enter pressed), analyze the previous paragraph
    if (newParagraphsCreated.length > 0 && localActiveParagraph) {
      const previousParagraph = paragraphs.find(p => p.id === localActiveParagraph)
      if (previousParagraph && previousParagraph.content.trim()) {
        // Only analyze if content hasn't been analyzed yet
        if (lastAnalyzedContent.current[localActiveParagraph] !== previousParagraph.content) {
          analyzeChangedParagraph(previousParagraph.id)
        }
      }
    }
    
    // Handle changed paragraphs - clear highlights when content changes
    changedParagraphs.forEach(paragraph => {
      const { id } = paragraph
      
      // Clear highlights for this paragraph immediately since the text has changed
      const updatedHighlights = highlights.filter(h => h.paragraphId !== id)
      onHighlightsChange(updatedHighlights)
      
      // Clear active highlight if it was in this paragraph
      if (activeHighlight) {
        const activeHighlightObj = highlights.find(h => h.id === activeHighlight)
        if (activeHighlightObj && activeHighlightObj.paragraphId === id) {
          onHighlightClick(null)
        }
      }
      
      // Clear analysis tracking for this paragraph since content changed
      delete lastAnalyzedContent.current[id]
    })
  }, [paragraphs, highlights, activeHighlight, onHighlightsChange, onHighlightClick, localActiveParagraph, analyzeChangedParagraph])

  const handleParagraphCreate = useCallback((id: string) => {
    // Don't change active paragraph if the current one is being analyzed
    // This preserves the loading state in the sidebar
    if (!analyzingParagraphs.has(localActiveParagraph || '')) {
      setLocalActiveParagraph(id)
    }
    // If analysis is running, let it complete before switching paragraphs
  }, [analyzingParagraphs, localActiveParagraph])

  const handleParagraphDelete = useCallback((id: string) => {
    // Clean up any ongoing analysis for this paragraph
    if (analysisAbortControllers.current[id]) {
      analysisAbortControllers.current[id].abort()
      delete analysisAbortControllers.current[id]
    }
    
    // Clear analysis tracking
    delete lastAnalyzedContent.current[id]
    
    // Remove highlights for this paragraph
    const updatedHighlights = highlights.filter(h => h.paragraphId !== id)
    onHighlightsChange(updatedHighlights)
    
    // Clear active highlight if it was in this paragraph
    if (activeHighlight) {
      const activeHighlightObj = highlights.find(h => h.id === activeHighlight)
      if (activeHighlightObj && activeHighlightObj.paragraphId === id) {
        onHighlightClick(null)
      }
    }
  }, [highlights, activeHighlight, onHighlightsChange, onHighlightClick])

  const handleParagraphFocus = useCallback((id: string) => {
    setLocalActiveParagraph(id)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <Header>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-lg transition-all duration-200"
          title="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </Header>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <TipTapEditor
          initialContent={paragraphs}
          onParagraphCreate={handleParagraphCreate}
          onParagraphDelete={handleParagraphDelete}
          onParagraphFocus={handleParagraphFocus}
          onContentChange={handleContentChange}
          highlights={highlights}
          activeHighlight={activeHighlight}
          onHighlightClick={onHighlightClick}
          activeParagraph={localActiveParagraph}
        />
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}