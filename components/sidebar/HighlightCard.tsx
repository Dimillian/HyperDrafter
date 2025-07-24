'use client'

import { useState } from 'react'

interface Highlight {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  text: string
  fullText?: string
  note: string
  confidence?: number
}

interface HighlightCardProps {
  highlight: Highlight
  isActive: boolean
  isExpanded: boolean
  onSelect: (id: string | null) => void
  onToggleExpand: (id: string) => void
}

export function HighlightCard({ 
  highlight, 
  isActive, 
  isExpanded, 
  onSelect, 
  onToggleExpand 
}: HighlightCardProps) {
  const handleCardClick = () => {
    onSelect(highlight.id)
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand(highlight.id)
  }

  const shouldShowDetails = isExpanded || isActive
  
  const getCategoryStyles = () => {
    switch (highlight.type) {
      case 'expansion':
        return isActive 
          ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20 bg-green-500/10'
          : 'hover:ring-1 hover:ring-green-500/50 hover:bg-green-500/5 border-l-4 border-green-500/60'
      case 'structure':
        return isActive
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 bg-blue-500/10'
          : 'hover:ring-1 hover:ring-blue-500/50 hover:bg-blue-500/5 border-l-4 border-blue-500/60'
      case 'factual':
        return isActive
          ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20 bg-red-500/10'
          : 'hover:ring-1 hover:ring-red-500/50 hover:bg-red-500/5 border-l-4 border-red-500/60'
      case 'logic':
        return isActive
          ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/20 bg-orange-500/10'
          : 'hover:ring-1 hover:ring-orange-500/50 hover:bg-orange-500/5 border-l-4 border-orange-500/60'
      case 'clarity':
        return isActive
          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 bg-purple-500/10'
          : 'hover:ring-1 hover:ring-purple-500/50 hover:bg-purple-500/5 border-l-4 border-purple-500/60'
      case 'evidence':
        return isActive
          ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20 bg-yellow-500/10'
          : 'hover:ring-1 hover:ring-yellow-500/50 hover:bg-yellow-500/5 border-l-4 border-yellow-500/60'
      case 'basic':
        return isActive
          ? 'ring-2 ring-gray-500 shadow-lg shadow-gray-500/20 bg-gray-500/10'
          : 'hover:ring-1 hover:ring-gray-500/50 hover:bg-gray-500/5 border-l-4 border-gray-500/60'
      default:
        return isActive
          ? 'ring-2 ring-gray-500 shadow-lg shadow-gray-500/20 bg-gray-500/10'
          : 'hover:ring-1 hover:ring-gray-500/50 hover:bg-gray-500/5 border-l-4 border-gray-500/60'
    }
  }

  const getCategoryColor = () => {
    switch (highlight.type) {
      case 'expansion': return 'text-green-400'
      case 'structure': return 'text-blue-400'
      case 'factual': return 'text-red-400'
      case 'logic': return 'text-orange-400'
      case 'clarity': return 'text-purple-400'
      case 'evidence': return 'text-yellow-400'
      case 'basic': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div
      className={`
        bg-[hsl(var(--paper-border))]/20 border border-[hsl(var(--paper-border))]/40 rounded-lg p-4 cursor-pointer transition-all duration-200
        ${getCategoryStyles()}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[hsl(var(--paper-foreground))]/90 mb-1">
            "{highlight.text}..."
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-wide ${getCategoryColor()}`}>
              {highlight.type}
            </span>
            {highlight.confidence && (
              <span className="text-xs text-[hsl(var(--paper-foreground))]/50">
                {Math.round(highlight.confidence * 100)}%
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleToggleClick}
          className="text-[hsl(var(--paper-foreground))]/50 hover:text-[hsl(var(--paper-foreground))]/80 ml-2"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {shouldShowDetails && (
        <div className="mt-3 pt-3 border-t border-purple-500/20">
          {highlight.fullText && highlight.fullText !== highlight.text && (
            <div className="mb-3">
              <p className="text-xs text-[hsl(var(--paper-foreground))]/50 mb-1">Full text:</p>
              <p className="text-sm text-[hsl(var(--paper-foreground))]/80 italic">"{highlight.fullText}"</p>
            </div>
          )}
          <p className="text-sm text-[hsl(var(--paper-foreground))]/70 mb-3">{highlight.note}</p>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors">
              Get Suggestions
            </button>
            <button className="text-xs px-3 py-1 bg-[hsl(var(--paper-border))]/50 text-[hsl(var(--paper-foreground))]/70 rounded hover:bg-[hsl(var(--paper-border))]/70 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}