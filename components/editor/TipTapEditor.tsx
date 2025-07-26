'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { History } from '@tiptap/extension-history'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { useEffect, memo } from 'react'
import { ParagraphWithId } from '@/lib/tiptap/extensions/ParagraphWithId'
import { AIHighlight } from '@/lib/tiptap/extensions/AIHighlight'
import { TipTapEditorProps, Paragraph } from '@/types/editor'

export const TipTapEditor = memo(function TipTapEditor({
  initialContent,
  onParagraphCreate,
  onParagraphDelete,
  onParagraphFocus,
  onContentChange,
  highlights,
  activeHighlight,
  onHighlightClick,
  activeParagraph
}: TipTapEditorProps) {
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Text,
      History,
      Dropcursor,
      Gapcursor,
      ParagraphWithId.configure({
        onParagraphCreate,
        onParagraphDelete,
        onParagraphFocus,
      }),
      AIHighlight.configure({
        onHighlightClick,
      }),
    ],
    content: generateInitialContent(initialContent),
    editorProps: {
      attributes: {
        class: 'editor-paper rounded-lg p-8 min-h-[800px] shadow-2xl space-y-2 focus:outline-none',
        spellcheck: 'false',
        'data-gramm': 'false',
        'data-gramm_editor': 'false',
        'data-enable-grammarly': 'false',
      },
      handlePaste: (view, event, slice) => {
        // Handle plain text paste
        const text = event.clipboardData?.getData('text/plain')
        if (text) {
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      // Extract paragraphs and their content
      const paragraphs: Paragraph[] = []
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraphWithId') {
          const id = node.attrs.id || `paragraph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const content = node.textContent || ''
          paragraphs.push({ id, content })
        }
      })
      
      // Call directly without setTimeout to avoid focus loss
      onContentChange(paragraphs)
    },
  })

  // Update highlights when they change
  useEffect(() => {
    if (!editor || !editor.isEditable) return

    // Use a timeout to batch highlight updates and avoid interrupting typing
    const timeoutId = setTimeout(() => {
      try {
        // Store current selection to restore it later
        const currentSelection = editor.state.selection
        
        // First, clear all existing highlights by removing all aiHighlight marks
        const { tr } = editor.state
        editor.state.doc.descendants((node, pos) => {
          if (node.marks) {
            node.marks.forEach(mark => {
              if (mark.type.name === 'aiHighlight') {
                tr.removeMark(pos, pos + node.nodeSize, mark.type)
              }
            })
          }
        })
        editor.view.dispatch(tr)
        
        // Then apply new highlights
        highlights.forEach(highlight => {
          const { paragraphId, startIndex, endIndex, id, type, priority, note, confidence } = highlight
          const isActive = activeHighlight === id
          
          // Find the paragraph in the document
          let paragraphPos = -1
          let paragraphNode: any = null
          
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'paragraphWithId' && node.attrs.id === paragraphId) {
              paragraphPos = pos
              paragraphNode = node
              return false // Stop iteration
            }
          })
          
          if (paragraphPos !== -1 && paragraphNode) {
            // Calculate absolute positions in the document
            const from = paragraphPos + 1 + startIndex // +1 for the paragraph node itself
            const to = paragraphPos + 1 + endIndex
            
            // Apply the highlight mark
            try {
              editor.commands.setTextSelection({ from, to })
              editor.commands.setAIHighlight({
                id,
                type,
                priority,
                note,
                confidence,
                isActive
              })
            } catch (error) {
              // Skip if there's an error applying the highlight
            }
          }
        })

        // Restore original selection to maintain cursor position
        try {
          editor.commands.setTextSelection(currentSelection)
        } catch (error) {
          // If we can't restore selection, at least don't blur
        }
      } catch (error) {
        // Ignore all errors during highlight updates
      }
    }, 10) // Small delay to batch updates

    return () => clearTimeout(timeoutId)
  }, [editor, highlights, activeHighlight])

  // Update active paragraph styling
  useEffect(() => {
    if (!editor || !editor.isEditable) return

    // Update all paragraphs to set/unset active state and title state
    try {
      const { tr } = editor.state
      let hasChanges = false
      let paragraphIndex = 0

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraphWithId') {
          const isActive = node.attrs.id === activeParagraph
          const currentlyActive = node.attrs.isActive
          const isTitle = paragraphIndex === 0
          const currentlyTitle = node.attrs.isTitle
          
          if (isActive !== currentlyActive || isTitle !== currentlyTitle) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, isActive, isTitle })
            hasChanges = true
          }
          
          paragraphIndex++
        }
      })

      if (hasChanges) {
        editor.view.dispatch(tr)
      }
    } catch (error) {
      // Ignore errors during initialization
    }
  }, [editor, activeParagraph])

  // Focus management - separate from styling updates
  useEffect(() => {
    if (!editor || !editor.isEditable || !activeParagraph) return
    
    // Only auto-focus when programmatically selecting (e.g., from sidebar)
    // Don't interfere with direct user clicks in the editor
    const isUserClick = editor.isFocused
    
    if (!isUserClick) {
      // This is likely a programmatic selection (from sidebar), so we can focus
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraphWithId' && node.attrs.id === activeParagraph) {
          editor.commands.focus(pos + 1)
          return false
        }
      })
    }
  }, [editor, activeParagraph])

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto w-full">
        <style jsx global>{`
          .ProseMirror p[data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            font-style: italic;
          }
          
          /* Force paragraph animations to work */
          .ProseMirror p[data-paragraph-id] {
            transition: all 0.3s ease-in-out !important;
            border-left: 4px solid transparent;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .ProseMirror p[data-paragraph-id][data-is-active="true"] {
            border-left-color: #a855f7 !important;
          }
          
          .ProseMirror p[data-paragraph-id]:hover:not([data-is-active="true"]) {
            border-left-color: #6b7280;
            background-color: rgba(107, 114, 128, 0.1);
          }
          
          /* Slide-in animation for sidebar cards */
          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .slide-in-cards {
            animation: slideInFromLeft 0.3s ease-in-out;
          }

          /* AI Highlight Styles */
          .ProseMirror .highlight {
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            border-radius: 2px;
            padding: 1px 2px;
          }

          /* Category-based highlight colors */
          .ProseMirror span[data-type="expansion"] {
            background-color: rgba(34, 197, 94, 0.2);
            border-bottom: 2px solid rgba(34, 197, 94, 0.6);
          }
          .ProseMirror span[data-type="expansion"]:hover {
            background-color: rgba(34, 197, 94, 0.3);
          }
          .ProseMirror span[data-type="expansion"][data-is-active="true"] {
            background-color: rgba(34, 197, 94, 0.4);
            border-bottom-color: rgb(34, 197, 94);
          }

          .ProseMirror span[data-type="structure"] {
            background-color: rgba(59, 130, 246, 0.2);
            border-bottom: 2px solid rgba(59, 130, 246, 0.6);
          }
          .ProseMirror span[data-type="structure"]:hover {
            background-color: rgba(59, 130, 246, 0.3);
          }
          .ProseMirror span[data-type="structure"][data-is-active="true"] {
            background-color: rgba(59, 130, 246, 0.4);
            border-bottom-color: rgb(59, 130, 246);
          }

          .ProseMirror span[data-type="factual"] {
            background-color: rgba(239, 68, 68, 0.2);
            border-bottom: 2px solid rgba(239, 68, 68, 0.6);
          }
          .ProseMirror span[data-type="factual"]:hover {
            background-color: rgba(239, 68, 68, 0.3);
          }
          .ProseMirror span[data-type="factual"][data-is-active="true"] {
            background-color: rgba(239, 68, 68, 0.4);
            border-bottom-color: rgb(239, 68, 68);
          }

          .ProseMirror span[data-type="logic"] {
            background-color: rgba(249, 115, 22, 0.2);
            border-bottom: 2px solid rgba(249, 115, 22, 0.6);
          }
          .ProseMirror span[data-type="logic"]:hover {
            background-color: rgba(249, 115, 22, 0.3);
          }
          .ProseMirror span[data-type="logic"][data-is-active="true"] {
            background-color: rgba(249, 115, 22, 0.4);
            border-bottom-color: rgb(249, 115, 22);
          }

          .ProseMirror span[data-type="clarity"] {
            background-color: rgba(168, 85, 247, 0.2);
            border-bottom: 2px solid rgba(168, 85, 247, 0.6);
          }
          .ProseMirror span[data-type="clarity"]:hover {
            background-color: rgba(168, 85, 247, 0.3);
          }
          .ProseMirror span[data-type="clarity"][data-is-active="true"] {
            background-color: rgba(168, 85, 247, 0.4);
            border-bottom-color: rgb(168, 85, 247);
          }

          .ProseMirror span[data-type="evidence"] {
            background-color: rgba(234, 179, 8, 0.2);
            border-bottom: 2px solid rgba(234, 179, 8, 0.6);
          }
          .ProseMirror span[data-type="evidence"]:hover {
            background-color: rgba(234, 179, 8, 0.3);
          }
          .ProseMirror span[data-type="evidence"][data-is-active="true"] {
            background-color: rgba(234, 179, 8, 0.4);
            border-bottom-color: rgb(234, 179, 8);
          }

          .ProseMirror span[data-type="basic"] {
            background-color: rgba(107, 114, 128, 0.2);
            border-bottom: 2px solid rgba(107, 114, 128, 0.6);
          }
          .ProseMirror span[data-type="basic"]:hover {
            background-color: rgba(107, 114, 128, 0.3);
          }
          .ProseMirror span[data-type="basic"][data-is-active="true"] {
            background-color: rgba(107, 114, 128, 0.4);
            border-bottom-color: rgb(107, 114, 128);
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

// Only re-render when key props change
TipTapEditor.displayName = 'TipTapEditor'

function generateInitialContent(paragraphs: Paragraph[]) {
  if (paragraphs.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraphWithId',
          attrs: { id: '1', isTitle: true },
          content: [],
        },
      ],
    }
  }

  return {
    type: 'doc',
    content: paragraphs.map((paragraph, index) => ({
      type: 'paragraphWithId',
      attrs: { 
        id: paragraph.id,
        isTitle: index === 0 
      },
      content: paragraph.content ? [
        {
          type: 'text',
          text: paragraph.content,
        },
      ] : [],
    })),
  }
}