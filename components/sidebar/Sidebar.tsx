'use client'

import { useState } from 'react'
import { HighlightCard } from './HighlightCard'

interface SidebarProps {
  highlights: any[]
  activeHighlight: string | null
  onHighlightSelect: (id: string | null) => void
  analyzingParagraphs: Array<{ id: string; content: string }>
  activeParagraph: string | null
  paragraphs: Array<{ id: string; content: string }>
  onParagraphSelect: (paragraphId: string) => void
}

export function Sidebar({ highlights, activeHighlight, onHighlightSelect, analyzingParagraphs, activeParagraph, paragraphs, onParagraphSelect }: SidebarProps) {
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

  const getFirstThreeWords = (content: string, paragraphId: string) => {
    const trimmed = content.trim()
    if (!trimmed) return `Paragraph ${paragraphId}`
    
    const words = trimmed.split(/\s+/).slice(0, 3)
    const preview = words.join(' ')
    return preview.length > 30 ? preview.slice(0, 30) + '...' : preview
  }

  return (
    <aside className="w-80 bg-[hsl(var(--paper))] border-l border-[hsl(var(--paper-border))] h-full overflow-hidden flex flex-col">
      <div className="px-4 py-4 border-b border-[hsl(var(--paper-border))] h-[69px] flex items-center">
        <p className="text-sm text-[hsl(var(--paper-foreground))] opacity-70">
          {highlights.length} suggestion{highlights.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Group highlights by paragraph */}
        {(() => {
          // Combine all paragraph IDs from highlights and analyzing paragraphs
          const allParagraphIds = [
            ...new Set([
              ...highlights.map((h: any) => h.paragraphId),
              ...analyzingParagraphs.map(p => p.id)
            ])
          ]

          return allParagraphIds.map(paragraphId => {
            const paragraphHighlights = highlights.filter((h: any) => h.paragraphId === paragraphId)
            const isAnalyzing = analyzingParagraphs.some(p => p.id === paragraphId)
            const isActive = activeParagraph === paragraphId
            const analyzingParagraph = analyzingParagraphs.find(p => p.id === paragraphId)
            const currentParagraph = paragraphs.find(p => p.id === paragraphId)
            
            // Get category counts and determine highest priority category
            const categoryCounts = paragraphHighlights.reduce((acc: any, h: any) => {
              acc[h.type] = (acc[h.type] || 0) + 1
              return acc
            }, {})

            const totalCount = paragraphHighlights.length
            
            // Determine the most important category for the indicator color
            const getHighestPriorityCategory = () => {
              if (categoryCounts.factual > 0) return 'factual'
              if (categoryCounts.logic > 0) return 'logic'
              if (categoryCounts.structure > 0) return 'structure'
              if (categoryCounts.expansion > 0) return 'expansion'
              if (categoryCounts.clarity > 0) return 'clarity'
              if (categoryCounts.evidence > 0) return 'evidence'
              if (categoryCounts.basic > 0) return 'basic'
              return null
            }
            
            const highestCategory = getHighestPriorityCategory()
            
            const getCategoryIndicatorColor = (category: string | null) => {
              switch (category) {
                case 'expansion': return 'bg-green-500'
                case 'structure': return 'bg-blue-500'
                case 'factual': return 'bg-red-500'
                case 'logic': return 'bg-orange-500'
                case 'clarity': return 'bg-purple-500'
                case 'evidence': return 'bg-yellow-500'
                case 'basic': return 'bg-gray-500'
                default: return 'bg-[hsl(var(--paper-foreground))]/30'
              }
            }

            return (
              <div key={paragraphId} className="space-y-1">
                {/* Compact Paragraph Indicator */}
                <button 
                  onClick={() => onParagraphSelect(paragraphId)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-purple-500/10 border-purple-500/30' 
                      : 'bg-[hsl(var(--paper-border))]/30 border-[hsl(var(--paper-border))] hover:bg-[hsl(var(--paper-border))]/50'
                    }
                  `}
                >
                  {/* Paragraph indicator */}
                  <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${isAnalyzing 
                      ? 'bg-purple-500 animate-pulse' 
                      : totalCount > 0 
                        ? getCategoryIndicatorColor(highestCategory)
                        : 'bg-[hsl(var(--paper-foreground))]/30'
                    }
                  `} />
                  
                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    {isAnalyzing && analyzingParagraph ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border border-purple-500 border-t-transparent" />
                        <span className="text-xs text-[hsl(var(--paper-foreground))]/70 truncate">
                          {analyzingParagraph.content.trim().slice(0, 40) || 'Empty paragraph'}...
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[hsl(var(--paper-foreground))]/70">
                        {getFirstThreeWords(currentParagraph?.content || '', paragraphId)}
                        {totalCount > 0 && (
                          <span className="ml-2 text-[hsl(var(--paper-foreground))]/50">
                            {categoryCounts.factual > 0 && <span className="text-red-400">●{categoryCounts.factual}</span>}
                            {categoryCounts.logic > 0 && <span className="text-orange-400 ml-1">●{categoryCounts.logic}</span>}
                            {categoryCounts.structure > 0 && <span className="text-blue-400 ml-1">●{categoryCounts.structure}</span>}
                            {categoryCounts.expansion > 0 && <span className="text-green-400 ml-1">●{categoryCounts.expansion}</span>}
                            {categoryCounts.clarity > 0 && <span className="text-purple-400 ml-1">●{categoryCounts.clarity}</span>}
                            {categoryCounts.evidence > 0 && <span className="text-yellow-400 ml-1">●{categoryCounts.evidence}</span>}
                            {categoryCounts.basic > 0 && <span className="text-gray-400 ml-1">●{categoryCounts.basic}</span>}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded cards for active paragraph */}
                {isActive && paragraphHighlights.length > 0 && (
                  <div className="ml-5 space-y-2 border-l-2 border-purple-500/30 pl-3">
                    {paragraphHighlights
                      .sort((a: any, b: any) => {
                        const categoryOrder: Record<string, number> = { 
                          factual: 0, logic: 1, structure: 2, expansion: 3, clarity: 4, evidence: 5, basic: 6 
                        }
                        return (categoryOrder[a.type] || 6) - (categoryOrder[b.type] || 6)
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
                    }
                  </div>
                )}
              </div>
            )
          })
        })()}

        {/* Empty state */}
        {highlights.length === 0 && analyzingParagraphs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[hsl(var(--paper-foreground))]/50 text-sm">
              Start typing and pause to see AI suggestions
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}