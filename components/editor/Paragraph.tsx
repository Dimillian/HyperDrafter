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
  onHighlightClick: (id: string) => void
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localContent, setLocalContent] = useState(content)

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isActive])

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter(id)
    } else if (e.key === 'Backspace' && localContent === '' && content === '') {
      e.preventDefault()
      onDelete(id)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    onChange(id, newContent)
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localContent])

  return (
    <div className={`relative group ${isActive ? 'z-10' : ''}`}>
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder="Start typing..."
        className={`
          w-full px-4 py-2 bg-transparent resize-none overflow-hidden
          text-gray-100 placeholder-gray-600 
          border-l-2 transition-all duration-200
          focus:outline-none
          ${isActive 
            ? 'border-primary-500 pl-5' 
            : 'border-transparent hover:border-gray-700'
          }
        `}
        rows={1}
      />
      {highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Highlight overlays would go here */}
        </div>
      )}
    </div>
  )
}