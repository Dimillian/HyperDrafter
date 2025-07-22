'use client'

import { Editor } from '@/components/editor/Editor'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useState } from 'react'

export default function Home() {
  const [highlights, setHighlights] = useState<any[]>([])
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)

  return (
    <main className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Editor 
          onHighlightsChange={setHighlights}
          activeHighlight={activeHighlight}
          onHighlightClick={setActiveHighlight}
        />
      </div>
      <Sidebar 
        highlights={highlights}
        activeHighlight={activeHighlight}
        onHighlightSelect={setActiveHighlight}
      />
    </main>
  )
}