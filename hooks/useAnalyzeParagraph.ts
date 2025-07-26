import { useCallback } from 'react'
import { Paragraph, Highlight } from '@/types/editor'
import { analysisService } from '@/services/editor/analysisService'

interface UseAnalyzeParagraphProps {
  paragraphs: Paragraph[]
  highlights: Highlight[]
  onHighlightsChange: (highlights: Highlight[]) => void
  setAnalyzingParagraphs: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function useAnalyzeParagraph({
  paragraphs,
  highlights,
  onHighlightsChange,
  setAnalyzingParagraphs
}: UseAnalyzeParagraphProps) {

  const analyzeChangedParagraph = useCallback(async (paragraphId: string) => {
    const paragraph = paragraphs.find(p => p.id === paragraphId)
    if (!paragraph || !paragraph.content.trim()) {
      // Remove highlights for empty paragraphs
      const updatedHighlights = highlights.filter(h => h.paragraphId !== paragraphId)
      onHighlightsChange(updatedHighlights)
      analysisService.clearAnalysisTracking(paragraphId)
      return
    }

    // Skip if already analyzed
    if (analysisService.hasBeenAnalyzed(paragraphId, paragraph.content)) {
      return
    }
    
    // Capture the content we're analyzing to validate later
    const contentBeingAnalyzed = paragraph.content
    
    // Add paragraph to analyzing set
    setAnalyzingParagraphs(prev => new Set([...prev, paragraphId]))
    
    try {
      const newHighlights = await analysisService.analyzeParagraph(paragraph, paragraphs)
      
      // Check if the paragraph still exists and content hasn't changed
      const currentParagraph = paragraphs.find(p => p.id === paragraphId)
      if (!currentParagraph || currentParagraph.content !== contentBeingAnalyzed) {
        return // Don't update highlights if paragraph changed
      }
      
      // Update highlights atomically by getting fresh state
      setAnalyzingParagraphs(currentAnalyzing => {
        // Only update if this paragraph is still being analyzed (not cancelled)
        if (currentAnalyzing.has(paragraphId)) {
          // Remove old highlights for this paragraph and add new ones
          const otherHighlights = highlights.filter(h => h.paragraphId !== paragraphId)
          const updatedHighlights = [...otherHighlights, ...newHighlights]
          onHighlightsChange(updatedHighlights)
        }
        return currentAnalyzing // Don't modify the analyzing set here
      })
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error analyzing paragraph:', error)
      }
    } finally {
      // Remove paragraph from analyzing set
      setAnalyzingParagraphs(prev => {
        const newSet = new Set(prev)
        newSet.delete(paragraphId)
        return newSet
      })
    }
  }, [paragraphs, highlights, onHighlightsChange, setAnalyzingParagraphs])

  const clearAnalysisTracking = useCallback((paragraphId: string) => {
    analysisService.clearAnalysisTracking(paragraphId)
  }, [])

  const cancelAnalysis = useCallback((paragraphId: string) => {
    analysisService.cancelAnalysis(paragraphId)
  }, [])

  return {
    analyzeChangedParagraph,
    clearAnalysisTracking,
    cancelAnalysis
  }
}