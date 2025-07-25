import { useState, useRef, useEffect } from 'react'
import { Paragraph } from '@/types/editor'

interface UseEditorStateProps {
  onActiveParagraphChange: (paragraphId: string | null) => void
  onParagraphsChange: (paragraphs: Paragraph[]) => void
  activeParagraph: string | null
}

export function useEditorState({ 
  onActiveParagraphChange, 
  onParagraphsChange,
  activeParagraph 
}: UseEditorStateProps) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([
    { id: '1', content: '' }
  ])
  const [localActiveParagraph, setLocalActiveParagraph] = useState<string>('1')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState<Set<string>>(new Set())
  const prevActiveParagraphRef = useRef<string | null>(null)

  // Sync external activeParagraph changes with local state
  useEffect(() => {
    if (activeParagraph && activeParagraph !== prevActiveParagraphRef.current) {
      setLocalActiveParagraph(activeParagraph)
      prevActiveParagraphRef.current = activeParagraph
    }
  }, [activeParagraph])

  // Notify parent of active paragraph changes
  useEffect(() => {
    onActiveParagraphChange(localActiveParagraph)
  }, [localActiveParagraph, onActiveParagraphChange])

  // Notify parent of paragraph changes
  useEffect(() => {
    onParagraphsChange(paragraphs)
  }, [paragraphs, onParagraphsChange])

  return {
    paragraphs,
    setParagraphs,
    localActiveParagraph,
    setLocalActiveParagraph,
    isSettingsOpen,
    setIsSettingsOpen,
    analyzingParagraphs,
    setAnalyzingParagraphs
  }
}