'use client'

import { Editor } from '@/components/editor/Editor'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useState } from 'react'

export default function Home() {
  const [highlights, setHighlights] = useState<any[]>([])
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState<string[]>([])

  return (
    <main className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Editor 
          onHighlightsChange={setHighlights}
          activeHighlight={activeHighlight}
          onHighlightClick={setActiveHighlight}
          highlights={highlights}
          onLoadingChange={setAnalyzingParagraphs}
        />
      </div>
      <Sidebar 
        highlights={highlights}
        activeHighlight={activeHighlight}
        onHighlightSelect={setActiveHighlight}
        analyzingParagraphs={analyzingParagraphs}
      />
    </main>
  )
}