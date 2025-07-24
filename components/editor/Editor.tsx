'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Paragraph } from './Paragraph'
import { useDebounce } from '@/hooks/useDebounce'
import { Header } from '@/components/ui'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

interface EditorProps {
  onHighlightsChange: (highlights: any[]) => void
  activeHighlight: string | null
  onHighlightClick: (id: string) => void
}

export function Editor({ onHighlightsChange, activeHighlight, onHighlightClick }: EditorProps) {
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
    const mockHighlights = paragraphs
      .filter(p => p.content.trim())
      .map((p, idx) => ({
        id: `highlight-${p.id}-${idx}`,
        paragraphId: p.id,
        type: 'suggestion',
        text: p.content.slice(0, 20),
        startIndex: 0,
        endIndex: 20,
        note: 'Consider expanding on this point...'
      }))
    
    onHighlightsChange(mockHighlights)
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
                highlights={[]}
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