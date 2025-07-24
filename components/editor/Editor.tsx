'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Paragraph } from './Paragraph'
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
  const editorRef = useRef<HTMLDivElement>(null)
  
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
      console.log(`Skipping duplicate analysis for paragraph ${paragraphId}`)
      return
    }

    // Cancel any ongoing analysis for this paragraph
    if (analysisAbortControllers.current[paragraphId]) {
      analysisAbortControllers.current[paragraphId].abort()
      console.log(`Cancelled ongoing analysis for paragraph ${paragraphId}`)
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
        console.log('Paragraph content changed during analysis - discarding highlights')
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
        console.log(`Analysis cancelled for paragraph ${paragraphId}`)
        return // Don't log as error, this is expected
      }
      console.error(`Failed to analyze paragraph ${paragraphId}:`, error)
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

  const handleParagraphChange = (id: string, content: string) => {
    setParagraphs(prev => prev.map(p => 
      p.id === id ? { ...p, content } : p
    ))
    
    // Cancel any ongoing analysis for this paragraph since content changed
    if (analysisAbortControllers.current[id]) {
      analysisAbortControllers.current[id].abort()
      delete analysisAbortControllers.current[id]
      console.log(`Cancelled analysis due to content change in paragraph ${id}`)
    }
    
    // Clear the analysis tracking for this paragraph since content changed
    delete lastAnalyzedContent.current[id]
    
    // Remove highlights for this paragraph immediately since the text has changed
    const updatedHighlights = highlights.filter(h => h.paragraphId !== id)
    onHighlightsChange(updatedHighlights)
    
    // Clear active highlight if it was in this paragraph
    if (activeHighlight) {
      const activeHighlightObj = highlights.find(h => h.id === activeHighlight)
      if (activeHighlightObj && activeHighlightObj.paragraphId === id) {
        onHighlightClick(null)
      }
    }
  }

  const handleEnter = (id: string) => {
    const currentIndex = paragraphs.findIndex(p => p.id === id)
    const currentParagraph = paragraphs[currentIndex]
    
    // Immediately analyze the current paragraph if it has content
    if (currentParagraph.content.trim()) {
      analyzeChangedParagraph(id)
    }
    
    const newId = Date.now().toString()
    const newParagraphs = [...paragraphs]
    newParagraphs.splice(currentIndex + 1, 0, { id: newId, content: '' })
    setParagraphs(newParagraphs)
    
    setTimeout(() => {
      setLocalActiveParagraph(newId)
    }, 0)
  }

  const handleDelete = (id: string) => {
    if (paragraphs.length > 1) {
      const currentIndex = paragraphs.findIndex(p => p.id === id)
      const newParagraphs = paragraphs.filter(p => p.id !== id)
      setParagraphs(newParagraphs)
      
      if (currentIndex > 0) {
        setLocalActiveParagraph(newParagraphs[currentIndex - 1].id)
      }
    }
  }

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
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={editorRef} 
            className="editor-paper rounded-lg p-8 min-h-[800px] shadow-2xl space-y-2"
          >
            {paragraphs.map((paragraph, index) => (
              <Paragraph
                key={paragraph.id}
                id={paragraph.id}
                content={paragraph.content}
                isActive={localActiveParagraph === paragraph.id}
                onChange={handleParagraphChange}
                onEnter={handleEnter}
                onDelete={handleDelete}
                onFocus={() => setLocalActiveParagraph(paragraph.id)}
                highlights={highlights.filter(h => h.paragraphId === paragraph.id)}
                activeHighlight={activeHighlight}
                onHighlightClick={onHighlightClick}
                isFirstParagraph={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}