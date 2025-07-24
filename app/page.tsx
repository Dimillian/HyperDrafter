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
    // Focus the paragraph in the editor
    setTimeout(() => {
      const paragraphElement = document.querySelector(`[data-paragraph-id="${paragraphId}"]`) as HTMLElement
      if (paragraphElement) {
        paragraphElement.focus()
      }
    }, 0)
  }

  return (
    <main className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Editor 
          onHighlightsChange={setHighlights}
          activeHighlight={activeHighlight}
          onHighlightClick={setActiveHighlight}
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
        onHighlightSelect={setActiveHighlight}
        analyzingParagraphs={analyzingParagraphs}
        activeParagraph={activeParagraph}
        paragraphs={paragraphs}
        onParagraphSelect={handleParagraphSelect}
      />
    </main>
  )
}