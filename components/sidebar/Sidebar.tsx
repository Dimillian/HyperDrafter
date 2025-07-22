'use client'

import { useState } from 'react'

interface SidebarProps {
  highlights: any[]
  activeHighlight: string | null
  onHighlightSelect: (id: string) => void
}

export function Sidebar({ highlights, activeHighlight, onHighlightSelect }: SidebarProps) {
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
    <aside className="w-80 bg-dark-tertiary border-l border-dark h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-dark">
        <h2 className="text-lg font-semibold text-gray-100">AI Feedback</h2>
        <p className="text-sm text-gray-500 mt-1">
          {highlights.length} suggestion{highlights.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {highlights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Start typing and pause to see AI suggestions
            </p>
          </div>
        ) : (
          highlights.map((highlight) => (
            <div
              key={highlight.id}
              className={`
                glass rounded-lg p-4 cursor-pointer transition-all duration-200
                ${activeHighlight === highlight.id 
                  ? 'ring-2 ring-primary-500 glow' 
                  : 'hover:ring-1 hover:ring-primary-500/50'
                }
              `}
              onClick={() => onHighlightSelect(highlight.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-1">
                    "{highlight.text}..."
                  </p>
                  <p className="text-xs text-primary-400 uppercase tracking-wide">
                    {highlight.type}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleNote(highlight.id)
                  }}
                  className="text-gray-500 hover:text-gray-300 ml-2"
                >
                  {expandedNotes.has(highlight.id) ? '−' : '+'}
                </button>
              </div>
              
              {expandedNotes.has(highlight.id) && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-sm text-gray-400">{highlight.note}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs px-3 py-1 bg-primary-500/20 text-primary-400 rounded hover:bg-primary-500/30 transition-colors">
                      Apply
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}