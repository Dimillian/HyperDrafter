'use client'

import { useRef, useEffect, useState } from 'react'

interface ParagraphProps {
  id: string
  content: string
  isActive: boolean
  onChange: (id: string, content: string) => void
  onEnter: (id: string) => void
  onDelete: (id: string) => void
  onFocus: () => void
  highlights: any[]
  activeHighlight: string | null
  onHighlightClick: (id: string | null) => void
}

function getCaretPosition(element: HTMLElement): number {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return 0
  
  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(element)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  
  return preCaretRange.toString().length
}

function setCaretPosition(element: HTMLElement, position: number) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  )
  
  let currentPos = 0
  let node
  
  while (node = walker.nextNode()) {
    const textNode = node as Text
    const nodeLength = textNode.textContent?.length || 0
    
    if (currentPos + nodeLength >= position) {
      const range = document.createRange()
      const selection = window.getSelection()
      
      range.setStart(textNode, position - currentPos)
      range.collapse(true)
      
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
    
    currentPos += nodeLength
  }
  
  // If position is beyond content, place at end
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(element)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

export function Paragraph({
  id,
  content,
  isActive,
  onChange,
  onEnter,
  onDelete,
  onFocus,
  highlights,
  activeHighlight,
  onHighlightClick
}: ParagraphProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isActive && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isActive])

  // Update content with highlights
  useEffect(() => {
    if (!editorRef.current || isUpdating) return
    
    // Only restore cursor position if this paragraph is currently active
    const shouldRestoreCursor = isActive && document.activeElement === editorRef.current
    const currentPosition = shouldRestoreCursor ? getCaretPosition(editorRef.current) : 0
    
    // Create content with highlights
    let htmlContent = ''
    
    if (highlights.length === 0) {
      // No highlights, just plain text
      htmlContent = content.replace(/\n/g, '<br>')
    } else {
      // Sort highlights by start position
      const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex)
      
      let lastIndex = 0
      
      sortedHighlights.forEach((highlight) => {
        // Add text before highlight
        const beforeText = content.slice(lastIndex, highlight.startIndex)
        htmlContent += beforeText.replace(/\n/g, '<br>')
        
        // Add highlighted text
        const highlightText = content.slice(highlight.startIndex, highlight.endIndex)
        const isActive = activeHighlight === highlight.id
        
        const priorityColors: Record<string, string> = {
          high: isActive ? 'bg-red-500/40 border-b-2 border-red-400' : 'bg-red-500/20 border-b-2 border-red-500/60 hover:bg-red-500/30',
          medium: isActive ? 'bg-purple-500/40 border-b-2 border-purple-400' : 'bg-purple-500/20 border-b-2 border-purple-500/60 hover:bg-purple-500/30',
          low: isActive ? 'bg-gray-500/40 border-b-2 border-gray-400' : 'bg-gray-500/20 border-b-2 border-gray-500/60 hover:bg-gray-500/30'
        }
        
        htmlContent += `<span 
          class="highlight cursor-pointer transition-colors duration-200 ${priorityColors[highlight.priority] || 'bg-gray-500/20 border-b-2 border-gray-500/60'}" 
          data-highlight-id="${highlight.id}"
          title="${highlight.priority} priority ${highlight.type}: ${highlight.note}"
        >${highlightText.replace(/\n/g, '<br>')}</span>`
        
        lastIndex = highlight.endIndex
      })
      
      // Add remaining text
      const remainingText = content.slice(lastIndex)
      htmlContent += remainingText.replace(/\n/g, '<br>')
    }
    
    if (editorRef.current.innerHTML !== htmlContent) {
      editorRef.current.innerHTML = htmlContent
      
      // Only restore cursor position if this paragraph is currently focused
      if (shouldRestoreCursor) {
        setTimeout(() => {
          if (editorRef.current && document.activeElement === editorRef.current) {
            setCaretPosition(editorRef.current, currentPosition)
          }
        }, 0)
      }
    }
  }, [content, highlights, activeHighlight, isUpdating, isActive])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdating) return
    
    const target = e.target as HTMLDivElement
    const textContent = target.textContent || ''
    
    setIsUpdating(true)
    onChange(id, textContent)
    
    // Reset updating flag after a brief delay
    setTimeout(() => setIsUpdating(false), 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter(id)
    } else if (e.key === 'Backspace' && !content.trim()) {
      e.preventDefault()
      onDelete(id)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('highlight')) {
      e.preventDefault()
      const highlightId = target.getAttribute('data-highlight-id')
      onHighlightClick(highlightId)
    }
  }

  return (
    <div className={`relative group ${isActive ? 'z-10' : ''}`}>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onClick={handleClick}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        spellCheck="false"
        className={`
          w-full px-4 py-2 bg-transparent resize-none overflow-hidden
          text-gray-100 placeholder-gray-600 min-h-[1.5rem]
          border-l-2 transition-all duration-200
          focus:outline-none whitespace-pre-wrap
          ${isActive 
            ? 'border-primary-500 pl-5' 
            : 'border-transparent hover:border-gray-700'
          }
        `}
        data-placeholder={content === '' ? 'Start typing...' : undefined}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    </div>
  )
}