import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface ParagraphWithIdOptions {
  HTMLAttributes: Record<string, any>
  onParagraphCreate?: (id: string) => void
  onParagraphDelete?: (id: string) => void  
  onParagraphFocus?: (id: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphWithId: {
      setParagraphWithId: (attributes?: { id?: string }) => ReturnType
    }
  }
}

export const ParagraphWithId = Node.create<ParagraphWithIdOptions>({
  name: 'paragraphWithId',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
      onParagraphCreate: undefined,
      onParagraphDelete: undefined,
      onParagraphFocus: undefined,
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const id = node.attrs.id || `paragraph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const isTitle = node.attrs.isTitle
    const isActive = node.attrs.isActive
    
    const baseClasses = `
      w-full bg-transparent resize-none overflow-hidden
      focus:outline-none whitespace-pre-wrap
    `.replace(/\s+/g, ' ').trim()
    
    const titleClasses = isTitle 
      ? 'py-2 min-h-[2.5rem] text-2xl font-bold leading-tight'
      : 'py-1 min-h-[1.5rem] text-base leading-normal'
    
    const placeholderAttr = !node.textContent ? (isTitle ? 'Enter your title...' : 'Start typing...') : undefined
    
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-paragraph-id': id,
        'data-is-title': isTitle ? 'true' : undefined,
        'data-is-active': isActive ? 'true' : undefined,
        'data-placeholder': placeholderAttr,
        class: `${baseClasses} ${titleClasses}`
      }),
      0,
    ]
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-paragraph-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-paragraph-id': attributes.id,
          }
        },
      },
      isTitle: {
        default: false,
        parseHTML: element => element.hasAttribute('data-is-title'),
        renderHTML: attributes => {
          if (!attributes.isTitle) {
            return {}
          }
          return {
            'data-is-title': 'true'
          }
        },
      },
      isActive: {
        default: false,
        parseHTML: element => element.hasAttribute('data-is-active'),
        renderHTML: attributes => {
          if (!attributes.isActive) {
            return {}
          }
          return {
            'data-is-active': 'true'
          }
        },
      }
    }
  },

  addCommands() {
    return {
      setParagraphWithId:
        (attributes) =>
        ({ commands }) => {
          const id = attributes?.id || `paragraph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          return commands.setNode(this.name, { ...attributes, id })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraphWithId(),
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        
        // Get current paragraph node and its attributes
        const currentNode = $from.node()
        const currentId = currentNode.attrs.id
        
        // Create new paragraph with new ID
        const newId = `paragraph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Notify about paragraph creation
        if (this.options.onParagraphCreate) {
          this.options.onParagraphCreate(newId)
        }
        
        // Split the paragraph and create new one
        return editor.commands.splitBlock({
          keepMarks: false,
        }) && editor.commands.setParagraphWithId({ id: newId })
      },
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from, $to } = selection
        
        // Check if we're at the very start of the document
        if ($from.pos === 1 && $to.pos === 1) {
          // Prevent backspace at the very beginning of the first paragraph
          return true
        }
        
        // Check if we're at the start of an empty paragraph
        if ($from.parentOffset === 0 && $from.parent.textContent === '') {
          const currentNode = $from.node()
          const currentId = currentNode.attrs.id
          
          // Don't delete if it's the only paragraph
          const doc = state.doc
          let paragraphCount = 0
          doc.descendants((node) => {
            if (node.type.name === 'paragraphWithId') {
              paragraphCount++
            }
          })
          
          if (paragraphCount > 1 && this.options.onParagraphDelete) {
            this.options.onParagraphDelete(currentId)
            return editor.commands.deleteNode('paragraphWithId')
          }
          
          // If it's the only paragraph, prevent deletion
          return true
        }
        
        return false // Let default backspace behavior handle other cases
      },
    }
  },

  addProseMirrorPlugins() {
    const updateFocusFromSelection = (view: any) => {
      const { state } = view
      const { selection } = state
      const { $from } = selection
      
      // Find the paragraph containing the cursor
      let paragraphNode = null
      
      for (let i = $from.depth; i >= 0; i--) {
        const node = $from.node(i)
        if (node.type.name === 'paragraphWithId') {
          paragraphNode = node
          break
        }
      }
      
      if (paragraphNode && this.options.onParagraphFocus) {
        const id = paragraphNode.attrs.id
        if (id) {
          this.options.onParagraphFocus(id)
        }
      }
    }

    return [
      new Plugin({
        key: new PluginKey('paragraphWithIdFocus'),
        props: {
          handleDOMEvents: {
            focus: (_view, event) => {
              const target = event.target as HTMLElement
              const paragraphEl = target.closest('[data-paragraph-id]')
              if (paragraphEl && this.options.onParagraphFocus) {
                const id = paragraphEl.getAttribute('data-paragraph-id')
                if (id) {
                  this.options.onParagraphFocus(id)
                }
              }
              return false
            },
            click: (_view, event) => {
              // Also detect clicks within paragraphs
              const target = event.target as HTMLElement
              const paragraphEl = target.closest('[data-paragraph-id]')
              if (paragraphEl && this.options.onParagraphFocus) {
                const id = paragraphEl.getAttribute('data-paragraph-id')
                if (id) {
                  this.options.onParagraphFocus(id)
                }
              }
              // Don't prevent default - let TipTap handle the cursor positioning
              return false
            },
            keydown: (view, _event) => {
              // After any key press, check if focus needs updating
              // Use setTimeout to ensure this runs after the key event is processed
              setTimeout(() => {
                updateFocusFromSelection(view)
              }, 0)
              return false
            }
          }
        },
        view() {
          return {
            update: (view) => {
              // Update focus whenever selection changes
              updateFocusFromSelection(view)
            }
          }
        }
      })
    ]
  },
})