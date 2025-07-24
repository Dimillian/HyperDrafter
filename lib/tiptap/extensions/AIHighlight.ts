import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface AIHighlightOptions {
  HTMLAttributes: Record<string, any>
  onHighlightClick?: (id: string | null) => void
}

export interface AIHighlightAttributes {
  id: string
  type: string
  priority: string
  note: string  
  confidence: number
  isActive: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiHighlight: {
      setAIHighlight: (attributes: AIHighlightAttributes) => ReturnType
      unsetAIHighlight: () => ReturnType
    }
  }
}

export const AIHighlight = Mark.create<AIHighlightOptions>({
  name: 'aiHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
      onHighlightClick: undefined,
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-highlight-id'),
        renderHTML: (attributes: any) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-highlight-id': attributes.id,
          }
        },
      },
      type: {
        default: 'basic',
        parseHTML: (element: any) => element.getAttribute('data-type'),
        renderHTML: (attributes: any) => {
          return {
            'data-type': attributes.type,
          }
        },
      },
      priority: {
        default: 'medium',
        parseHTML: (element: any) => element.getAttribute('data-priority'),
        renderHTML: (attributes: any) => {
          return {
            'data-priority': attributes.priority,
          }
        },
      },
      note: {
        default: '',
        parseHTML: (element: any) => element.getAttribute('data-note') || '',
        renderHTML: (attributes: any) => {
          return {
            'data-note': attributes.note,
          }
        },
      },
      confidence: {
        default: 0.5,
        parseHTML: (element: any) => parseFloat(element.getAttribute('data-confidence') || '0.5'),
        renderHTML: (attributes: any) => {
          return {
            'data-confidence': attributes.confidence.toString(),
          }
        },
      },
      isActive: {
        default: false,
        parseHTML: (element: any) => element.hasAttribute('data-is-active'),
        renderHTML: (attributes: any) => {
          if (attributes.isActive) {
            return {
              'data-is-active': 'true',
            }
          }
          return {}
        },
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-highlight-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, mark }: { HTMLAttributes: any, mark: any }) {
    const { type, isActive } = mark.attrs
    
    // Category-based styling matching the original implementation
    const categoryColors: Record<string, string> = {
      expansion: isActive ? 'bg-green-500/40 border-b-2 border-green-400' : 'bg-green-500/20 border-b-2 border-green-500/60 hover:bg-green-500/30',
      structure: isActive ? 'bg-blue-500/40 border-b-2 border-blue-400' : 'bg-blue-500/20 border-b-2 border-blue-500/60 hover:bg-blue-500/30',
      factual: isActive ? 'bg-red-500/40 border-b-2 border-red-400' : 'bg-red-500/20 border-b-2 border-red-500/60 hover:bg-red-500/30',
      logic: isActive ? 'bg-orange-500/40 border-b-2 border-orange-400' : 'bg-orange-500/20 border-b-2 border-orange-500/60 hover:bg-orange-500/30',
      clarity: isActive ? 'bg-purple-500/40 border-b-2 border-purple-400' : 'bg-purple-500/20 border-b-2 border-purple-500/60 hover:bg-purple-500/30',
      evidence: isActive ? 'bg-yellow-500/40 border-b-2 border-yellow-400' : 'bg-yellow-500/20 border-b-2 border-yellow-500/60 hover:bg-yellow-500/30',
      basic: isActive ? 'bg-gray-500/40 border-b-2 border-gray-400' : 'bg-gray-500/20 border-b-2 border-gray-500/60 hover:bg-gray-500/30'
    }

    const colorClass = categoryColors[type] || 'bg-gray-500/20 border-b-2 border-gray-500/60'
    const title = `${type} (${mark.attrs.priority} priority): ${mark.attrs.note}`

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `highlight cursor-pointer transition-colors duration-200 ${colorClass}`,
        title,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setAIHighlight:
        (attributes: any) =>
        ({ commands }: any) => {
          return commands.setMark(this.name, attributes)
        },
      unsetAIHighlight:
        () =>
        ({ commands }: any) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('aiHighlightClick'),
        props: {
          handleDOMEvents: {
            click: (_view: any, event: any) => {
              const target = event.target as HTMLElement
              if (target.classList.contains('highlight') && this.options.onHighlightClick) {
                event.preventDefault()
                event.stopPropagation()
                const highlightId = target.getAttribute('data-highlight-id')
                this.options.onHighlightClick(highlightId)
                return true
              }
              return false
            },
          },
        },
      })
    ]
  },
})