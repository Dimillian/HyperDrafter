export interface Paragraph {
  id: string
  content: string
}

export interface Highlight {
  id: string
  paragraphId: string
  type: string
  priority: 'high' | 'medium' | 'low'
  text: string
  startIndex: number
  endIndex: number
  note: string
  confidence: number
  fullText: string
}

export interface EditorProps {
  onHighlightsChange: (highlights: Highlight[]) => void
  activeHighlight: string | null
  onHighlightClick: (id: string | null) => void
  highlights: Highlight[]
  onLoadingChange: (loadingParagraphs: Paragraph[]) => void
  onActiveParagraphChange: (paragraphId: string | null) => void
  onParagraphsChange: (paragraphs: Paragraph[]) => void
  activeParagraph: string | null
}

export interface TipTapEditorProps {
  initialContent: Paragraph[]
  onParagraphCreate: (id: string) => void
  onParagraphDelete: (id: string) => void
  onParagraphFocus: (id: string) => void
  onContentChange: (paragraphs: Paragraph[]) => void
  highlights: Highlight[]
  activeHighlight: string | null
  onHighlightClick: (id: string | null) => void
  activeParagraph: string | null
}

export interface AIHighlightAttributes {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  note: string
  confidence: number
  isActive: boolean
}