import { useEffect, useRef } from 'react'

export function useParagraphDebounce(
  paragraphs: Array<{ id: string; content: string }>,
  onParagraphReady: (paragraphId: string) => void,
  delay: number = 1000
) {
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const previousContentRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const timeouts = timeoutsRef.current
    const previousContent = previousContentRef.current

    paragraphs.forEach(paragraph => {
      const { id, content } = paragraph
      const prevContent = previousContent.get(id) || ''
      
      // Only process if content actually changed
      if (content !== prevContent) {
        // Clear existing timeout for this paragraph
        const existingTimeout = timeouts.get(id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        // Set new timeout for this paragraph
        if (content.trim()) {
          const timeout = setTimeout(() => {
            onParagraphReady(id)
            timeouts.delete(id)
          }, delay)
          
          timeouts.set(id, timeout)
        } else {
          // If content is empty, remove any pending timeout
          timeouts.delete(id)
        }

        // Update previous content
        previousContent.set(id, content)
      }
    })

    // Clean up timeouts for paragraphs that no longer exist
    const currentIds = new Set(paragraphs.map(p => p.id))
    for (const [id, timeout] of timeouts.entries()) {
      if (!currentIds.has(id)) {
        clearTimeout(timeout)
        timeouts.delete(id)
        previousContent.delete(id)
      }
    }

    // Cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [paragraphs, onParagraphReady, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const timeouts = timeoutsRef.current
      timeouts.forEach(timeout => clearTimeout(timeout))
      timeouts.clear()
      previousContentRef.current.clear()
    }
  }, [])
}