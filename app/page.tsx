'use client'

import { Editor } from '@/components/editor/Editor'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useState } from 'react'

export default function Home() {
  const [highlights, setHighlights] = useState<any[]>([])
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState<Array<{ id: string; content: string }>>([])
  const [activeParagraph, setActiveParagraph] = useState<string | null>(null)
  const [paragraphs, setParagraphs] = useState<Array<{ id: string; content: string }>>([])

  const handleParagraphSelect = (paragraphId: string) => {
    setActiveParagraph(paragraphId)
    // TipTap editor will handle focus management internally
  }

  const handleHighlightClick = (highlightId: string | null) => {
    if (!highlightId) {
      setActiveHighlight(null)
      return
    }

    // Find which paragraph this highlight belongs to and open its section in sidebar
    const highlight = highlights.find(h => h.id === highlightId)
    if (highlight && highlight.paragraphId !== activeParagraph) {
      setActiveParagraph(highlight.paragraphId)
    }
    
    // Set the active highlight
    setActiveHighlight(highlightId)
  }

  return (
    <main className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Editor 
          onHighlightsChange={setHighlights}
          activeHighlight={activeHighlight}
          onHighlightClick={handleHighlightClick}
          highlights={highlights}
          onLoadingChange={setAnalyzingParagraphs}
          onActiveParagraphChange={setActiveParagraph}
          onParagraphsChange={setParagraphs}
          activeParagraph={activeParagraph}
        />
      </div>
      <Sidebar 
        highlights={highlights}
        activeHighlight={activeHighlight}
        onHighlightSelect={handleHighlightClick}
        analyzingParagraphs={analyzingParagraphs}
        activeParagraph={activeParagraph}
        paragraphs={paragraphs}
        onParagraphSelect={handleParagraphSelect}
      />
    </main>
  )
}