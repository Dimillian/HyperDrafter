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
  onLoadingChange: (loadingParagraphs: string[]) => void
}

export function Editor({ onHighlightsChange, activeHighlight, onHighlightClick, highlights, onLoadingChange }: EditorProps) {
  const [paragraphs, setParagraphs] = useState<Array<{ id: string; content: string }>>([
    { id: '1', content: '' }
  ])
  const [activeParagraph, setActiveParagraph] = useState<string>('1')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState<Set<string>>(new Set())
  const editorRef = useRef<HTMLDivElement>(null)

  const analyzeChangedParagraph = useCallback(async (paragraphId: string) => {
    const paragraph = paragraphs.find(p => p.id === paragraphId)
    if (!paragraph || !paragraph.content.trim()) {
      // Remove highlights for empty paragraphs
      const updatedHighlights = highlights.filter(h => h.paragraphId !== paragraphId)
      onHighlightsChange(updatedHighlights)
      return
    }

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
      
      const response = await anthropicService.identifySpans(analysisContent, fullDocumentContext)
      
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
      
    } catch (error) {
      console.error(`Failed to analyze paragraph ${paragraphId}:`, error)
    } finally {
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
    onLoadingChange([...analyzingParagraphs])
  }, [analyzingParagraphs, onLoadingChange])

  const handleParagraphChange = (id: string, content: string) => {
    setParagraphs(prev => prev.map(p => 
      p.id === id ? { ...p, content } : p
    ))
    
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
      setActiveParagraph(newId)
    }, 0)
  }

  const handleDelete = (id: string) => {
    if (paragraphs.length > 1) {
      const currentIndex = paragraphs.findIndex(p => p.id === id)
      const newParagraphs = paragraphs.filter(p => p.id !== id)
      setParagraphs(newParagraphs)
      
      if (currentIndex > 0) {
        setActiveParagraph(newParagraphs[currentIndex - 1].id)
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
                isActive={activeParagraph === paragraph.id}
                onChange={handleParagraphChange}
                onEnter={handleEnter}
                onDelete={handleDelete}
                onFocus={() => setActiveParagraph(paragraph.id)}
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