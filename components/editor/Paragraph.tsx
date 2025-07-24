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
  isFirstParagraph?: boolean
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
  onHighlightClick,
  isFirstParagraph = false
}: ParagraphProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastRenderedContent, setLastRenderedContent] = useState('')

  useEffect(() => {
    if (isActive && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isActive])

  // Update content with highlights
  useEffect(() => {
    if (!editorRef.current || isUpdating) return
    
    // Prevent update if user is actively typing
    const isUserTyping = document.activeElement === editorRef.current
    if (isUserTyping && content !== lastRenderedContent) {
      // User is typing and content has changed - don't interfere
      return
    }
    
    // Only restore cursor position if this paragraph is currently active and not typing
    const shouldRestoreCursor = isActive && document.activeElement === editorRef.current && !isUserTyping
    const currentPosition = shouldRestoreCursor ? getCaretPosition(editorRef.current) : 0
    
    // Check if current textContent matches what we expect
    const currentTextContent = editorRef.current.textContent || ''
    if (currentTextContent !== content) {
      // Content mismatch - user might be typing, skip update
      return
    }
    
    // Create content with highlights
    let htmlContent = ''
    
    if (highlights.length === 0) {
      // No highlights, just plain text
      htmlContent = content.replace(/\n/g, '<br>')
    } else {
      // Validate and filter highlights first
      const validHighlights = highlights.filter(highlight => {
        // Check bounds
        if (highlight.startIndex < 0 || highlight.endIndex > content.length || highlight.startIndex >= highlight.endIndex) {
          console.warn('Invalid highlight bounds:', highlight, 'Content length:', content.length)
          return false
        }
        
        // The highlight should extract valid text from content
        const extractedText = content.slice(highlight.startIndex, highlight.endIndex)
        if (!extractedText || extractedText.length === 0) {
          console.warn('Highlight extracts empty text:', highlight)
          return false
        }
        
        return true
      })
      
      if (validHighlights.length === 0) {
        // No valid highlights, just plain text
        htmlContent = content.replace(/\n/g, '<br>')
      } else {
        // Sort valid highlights by start position
        const sortedHighlights = [...validHighlights].sort((a, b) => a.startIndex - b.startIndex)
        
        // Handle overlapping highlights by prioritizing longer spans
        const nonOverlappingHighlights: typeof sortedHighlights = []
        
        for (const highlight of sortedHighlights) {
          let hasOverlap = false
          
          // Check if this highlight overlaps with any already accepted highlight
          for (const accepted of nonOverlappingHighlights) {
            if (!(highlight.endIndex <= accepted.startIndex || highlight.startIndex >= accepted.endIndex)) {
              // There's an overlap - prioritize the longer highlight
              if ((highlight.endIndex - highlight.startIndex) > (accepted.endIndex - accepted.startIndex)) {
                // Remove the shorter accepted highlight and add this longer one
                const index = nonOverlappingHighlights.indexOf(accepted)
                nonOverlappingHighlights.splice(index, 1)
                nonOverlappingHighlights.push(highlight)
                nonOverlappingHighlights.sort((a, b) => a.startIndex - b.startIndex)
              }
              hasOverlap = true
              break
            }
          }
          
          if (!hasOverlap) {
            nonOverlappingHighlights.push(highlight)
            nonOverlappingHighlights.sort((a, b) => a.startIndex - b.startIndex)
          }
        }
        
        let lastIndex = 0
        
        nonOverlappingHighlights.forEach((highlight) => {
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
    }
    
    if (editorRef.current.innerHTML !== htmlContent) {
      editorRef.current.innerHTML = htmlContent
      setLastRenderedContent(content)
      
      // Only restore cursor position if this paragraph is currently focused
      if (shouldRestoreCursor) {
        setTimeout(() => {
          if (editorRef.current && document.activeElement === editorRef.current) {
            setCaretPosition(editorRef.current, currentPosition)
          }
        }, 0)
      }
    }
  }, [content, highlights, activeHighlight, isUpdating, isActive, lastRenderedContent])

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
        data-paragraph-id={id}
        spellCheck="false"
        className={`
          w-full px-4 bg-transparent resize-none overflow-hidden
          border-l-4 transition-all duration-200
          focus:outline-none whitespace-pre-wrap
          ${isFirstParagraph 
            ? 'py-2 min-h-[2.5rem] text-2xl font-bold leading-tight'
            : 'py-1 min-h-[1.5rem] text-base leading-normal'
          }
          ${isActive 
            ? 'border-purple-500 pl-6 bg-purple-50/30 dark:bg-purple-900/10' 
            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
          }
        `}
        data-placeholder={content === '' ? (isFirstParagraph ? 'Enter your title...' : 'Start typing...') : undefined}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          fontFamily: 'inherit'
        }}
      />
    </div>
  )
}