'use client'

import { useState } from 'react'
import { HighlightCard } from './HighlightCard'

interface SidebarProps {
  highlights: any[]
  activeHighlight: string | null
  onHighlightSelect: (id: string | null) => void
  analyzingParagraphs: Array<{ id: string; content: string }>
}

export function Sidebar({ highlights, activeHighlight, onHighlightSelect, analyzingParagraphs }: SidebarProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Feedback</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {highlights.length} suggestion{highlights.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Show loading indicators for paragraphs being analyzed */}
        {analyzingParagraphs.map(paragraph => {
          const previewText = paragraph.content.trim().slice(0, 50) + (paragraph.content.length > 50 ? '...' : '')
          const displayText = previewText || 'Empty paragraph'
          
          return (
            <div key={`loading-${paragraph.id}`} className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Analyzing...</p>
                  <p className="text-gray-700 dark:text-gray-300 text-xs font-mono truncate mt-1">
                    "{displayText}"
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {highlights.length === 0 && analyzingParagraphs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start typing and pause to see AI suggestions
            </p>
          </div>
        ) : (
          highlights
            .sort((a: any, b: any) => {
              const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
              return priorityOrder[a.priority] - priorityOrder[b.priority]
            })
            .map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                isActive={activeHighlight === highlight.id}
                isExpanded={expandedNotes.has(highlight.id)}
                onSelect={onHighlightSelect}
                onToggleExpand={toggleNote}
              />
            ))
        )}
      </div>
    </aside>
  )
}