import { useCallback } from 'react'
import { Paragraph, Highlight } from '@/types/editor'
import { analysisService } from '@/services/editor/analysisService'

interface UseEditorHandlersProps {
  paragraphs: Paragraph[]
  setParagraphs: React.Dispatch<React.SetStateAction<Paragraph[]>>
  localActiveParagraph: string
  setLocalActiveParagraph: React.Dispatch<React.SetStateAction<string>>
  analyzingParagraphs: Set<string>
  highlights: Highlight[]
  activeHighlight: string | null
  onHighlightsChange: (highlights: Highlight[]) => void
  onHighlightClick: (id: string | null) => void
  analyzeChangedParagraph: (paragraphId: string) => Promise<void>
  clearAnalysisTracking: (paragraphId: string) => void
  cancelAnalysis: (paragraphId: string) => void
}

export function useEditorHandlers({
  paragraphs,
  setParagraphs,
  localActiveParagraph,
  setLocalActiveParagraph,
  analyzingParagraphs,
  highlights,
  activeHighlight,
  onHighlightsChange,
  onHighlightClick,
  analyzeChangedParagraph,
  clearAnalysisTracking,
  cancelAnalysis
}: UseEditorHandlersProps) {
  
  const handleContentChange = useCallback((newParagraphs: Paragraph[]) => {
    // Check which paragraphs have changed content
    const changedParagraphs = newParagraphs.filter(newP => {
      const oldP = paragraphs.find(p => p.id === newP.id)
      return !oldP || oldP.content !== newP.content
    })
    
    // Check if new paragraphs were created (Enter key pressed)
    const newParagraphsCreated = newParagraphs.filter(newP => !paragraphs.find(p => p.id === newP.id))
    
    // Only update if there are actual changes
    if (changedParagraphs.length === 0 && newParagraphs.length === paragraphs.length) {
      return
    }
    
    // Update paragraphs state
    setParagraphs(newParagraphs)
    
    // If new paragraphs were created (Enter pressed), analyze the previous paragraph
    if (newParagraphsCreated.length > 0 && localActiveParagraph) {
      const previousParagraph = paragraphs.find(p => p.id === localActiveParagraph)
      if (previousParagraph && previousParagraph.content.trim()) {
        // Only analyze if content hasn't been analyzed yet AND it's not currently being analyzed
        if (!analysisService.hasBeenAnalyzed(localActiveParagraph, previousParagraph.content) && !analyzingParagraphs.has(localActiveParagraph)) {
          analyzeChangedParagraph(previousParagraph.id)
        }
      }
    }
    
    // Handle changed paragraphs - clear highlights when content changes
    changedParagraphs.forEach(paragraph => {
      const { id } = paragraph
      const isEnterScenario = newParagraphsCreated.length > 0
      
      // Only clear analysis tracking if content changed and it's not an Enter scenario
      // Also don't clear if content just became empty (likely temporary during highlight application)
      const oldParagraph = paragraphs.find(p => p.id === id)
      const contentActuallyChanged = !oldParagraph || oldParagraph.content !== paragraph.content
      
      if (contentActuallyChanged && !isEnterScenario && paragraph.content.trim() !== '') {
        // Clear highlights for this paragraph immediately since the text has changed
        const updatedHighlights = highlights.filter(h => h.paragraphId !== id)
        onHighlightsChange(updatedHighlights)
        
        // Clear active highlight if it was in this paragraph
        if (activeHighlight) {
          const activeHighlightObj = highlights.find(h => h.id === activeHighlight)
          if (activeHighlightObj && activeHighlightObj.paragraphId === id) {
            onHighlightClick(null)
          }
        }
        
        // Clear analysis tracking for this paragraph since content changed
        clearAnalysisTracking(id)
      }
    })
  }, [
    paragraphs, 
    setParagraphs, 
    highlights, 
    activeHighlight, 
    onHighlightsChange, 
    onHighlightClick, 
    localActiveParagraph, 
    analyzeChangedParagraph,
    clearAnalysisTracking,
    analyzingParagraphs
  ])

  const handleParagraphCreate = useCallback((id: string) => {
    // Don't change active paragraph if the current one is being analyzed
    // This preserves the loading state in the sidebar
    if (!analyzingParagraphs.has(localActiveParagraph || '')) {
      setLocalActiveParagraph(id)
    }
    // If analysis is running, let it complete before switching paragraphs
  }, [analyzingParagraphs, localActiveParagraph, setLocalActiveParagraph])

  const handleParagraphDelete = useCallback((id: string) => {
    // Clean up any ongoing analysis for this paragraph
    cancelAnalysis(id)
    
    // Clear analysis tracking
    clearAnalysisTracking(id)
    
    // Remove highlights for this paragraph
    const updatedHighlights = highlights.filter(h => h.paragraphId !== id)
    onHighlightsChange(updatedHighlights)
    
    // Clear active highlight if it was in this paragraph
    if (activeHighlight) {
      const activeHighlightObj = highlights.find(h => h.id === activeHighlight)
      if (activeHighlightObj && activeHighlightObj.paragraphId === id) {
        onHighlightClick(null)
      }
    }
  }, [
    highlights, 
    activeHighlight, 
    onHighlightsChange, 
    onHighlightClick,
    cancelAnalysis,
    clearAnalysisTracking
  ])

  const handleParagraphFocus = useCallback((id: string) => {
    setLocalActiveParagraph(id)
  }, [setLocalActiveParagraph])

  return {
    handleContentChange,
    handleParagraphCreate,
    handleParagraphDelete,
    handleParagraphFocus
  }
}