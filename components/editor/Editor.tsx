'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Paragraph } from './Paragraph'
import { useDebounce } from '@/hooks/useDebounce'
import { Header } from '@/components/ui'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { anthropicService } from '@/lib/ai/anthropic'
import { SpanIdentification } from '@/lib/ai/types'

interface EditorProps {
  onHighlightsChange: (highlights: any[]) => void
  activeHighlight: string | null
  onHighlightClick: (id: string) => void
  highlights: any[]
}

export function Editor({ onHighlightsChange, activeHighlight, onHighlightClick, highlights }: EditorProps) {
  const [paragraphs, setParagraphs] = useState<Array<{ id: string; content: string }>>([
    { id: '1', content: '' }
  ])
  const [activeParagraph, setActiveParagraph] = useState<string>('1')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const debouncedContent = useDebounce(paragraphs, 1000)

  useEffect(() => {
    if (debouncedContent.some(p => p.content.trim())) {
      analyzeContent()
    }
  }, [debouncedContent])

  const analyzeContent = async () => {
    // Update service credentials in case they changed
    anthropicService.updateCredentials()
    
    const allHighlights: any[] = []
    
    // Process each paragraph with content
    for (const paragraph of paragraphs) {
      if (!paragraph.content.trim()) continue
      
      try {
        const response = await anthropicService.identifySpans(paragraph.content)
        
        // Convert spans to highlights
        const paragraphHighlights = response.spans.map((span: SpanIdentification, idx: number) => ({
          id: `highlight-${paragraph.id}-${idx}`,
          paragraphId: paragraph.id,
          type: span.type,
          text: span.text.slice(0, 30) + (span.text.length > 30 ? '...' : ''),
          startIndex: span.startOffset,
          endIndex: span.endOffset,
          note: span.reasoning,
          confidence: span.confidence
        }))
        
        allHighlights.push(...paragraphHighlights)
      } catch (error) {
        console.error(`Failed to analyze paragraph ${paragraph.id}:`, error)
      }
    }
    
    onHighlightsChange(allHighlights)
  }

  const handleParagraphChange = (id: string, content: string) => {
    setParagraphs(prev => prev.map(p => 
      p.id === id ? { ...p, content } : p
    ))
  }

  const handleEnter = (id: string) => {
    const currentIndex = paragraphs.findIndex(p => p.id === id)
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
    <div className="h-full bg-dark-secondary flex flex-col">
      <Header>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
          title="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </Header>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div ref={editorRef} className="space-y-4">
            {paragraphs.map((paragraph) => (
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