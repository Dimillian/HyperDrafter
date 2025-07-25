'use client'

import { useEffect, useMemo } from 'react'
import { TipTapEditor } from './TipTapEditor'
import { useParagraphDebounce } from '@/hooks/useParagraphDebounce'
import { useAnalyzeParagraph } from '@/hooks/useAnalyzeParagraph'
import { useEditorState } from '@/hooks/useEditorState'
import { useEditorHandlers } from '@/hooks/useEditorHandlers'
import { Header } from '@/components/ui'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { EditorProps } from '@/types/editor'

export function Editor({ 
  onHighlightsChange, 
  activeHighlight, 
  onHighlightClick, 
  highlights, 
  onLoadingChange, 
  onActiveParagraphChange, 
  onParagraphsChange, 
  activeParagraph 
}: EditorProps) {
  // State management
  const {
    paragraphs,
    setParagraphs,
    localActiveParagraph,
    setLocalActiveParagraph,
    isSettingsOpen,
    setIsSettingsOpen,
    analyzingParagraphs,
    setAnalyzingParagraphs
  } = useEditorState({ onActiveParagraphChange, onParagraphsChange, activeParagraph })

  // Analysis logic
  const {
    analyzeChangedParagraph,
    clearAnalysisTracking,
    cancelAnalysis
  } = useAnalyzeParagraph({ paragraphs, highlights, onHighlightsChange, setAnalyzingParagraphs })

  // Event handlers
  const {
    handleContentChange,
    handleParagraphCreate,
    handleParagraphDelete,
    handleParagraphFocus
  } = useEditorHandlers({
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
  })

  // Use per-paragraph debouncing for truly parallel analysis
  useParagraphDebounce(paragraphs, analyzeChangedParagraph, 1000)

  // Convert analyzing paragraphs Set to array with content for loading callback
  const analyzingParagraphsWithContent = useMemo(() => {
    return [...analyzingParagraphs].map(paragraphId => {
      const paragraph = paragraphs.find(p => p.id === paragraphId)
      return {
        id: paragraphId,
        content: paragraph?.content || ''
      }
    })
  }, [analyzingParagraphs, paragraphs])

  useEffect(() => {
    onLoadingChange(analyzingParagraphsWithContent)
  }, [analyzingParagraphsWithContent, onLoadingChange])

  return (
    <div className="h-full flex flex-col">
      <Header>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-lg transition-all duration-200"
          title="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </Header>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <TipTapEditor
          initialContent={paragraphs}
          onParagraphCreate={handleParagraphCreate}
          onParagraphDelete={handleParagraphDelete}
          onParagraphFocus={handleParagraphFocus}
          onContentChange={handleContentChange}
          highlights={highlights}
          activeHighlight={activeHighlight}
          onHighlightClick={onHighlightClick}
          activeParagraph={localActiveParagraph}
        />
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}