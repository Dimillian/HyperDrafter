# HyperDrafter 🚀

A sophisticated AI-powered writing editor that provides intelligent feedback as you write. Built with a focus on seamless text editing and contextual AI assistance.

## ✨ Key Features

- **📝 Professional Editor**: TipTap-powered editor with typewriter font and elegant paper styling
- **🤖 Intelligent AI Analysis**: Real-time feedback with category-based highlighting system using TipTap marks
- **🎯 Contextual Highlights**: Seven feedback categories (expansion, structure, factual, logic, clarity, evidence, basic) with distinct colors
- **📊 Smart Sidebar**: Compact paragraph indicators with smooth animations and expandable detailed feedback
- **🔄 Document Context**: AI analyzes each paragraph within full document context for better suggestions
- **⚡ Modern Architecture**: TipTap framework with custom extensions for paragraph-based AI analysis
- **✨ Smooth Animations**: Polished transitions for paragraph selection and visual state changes

## 🎨 Design Philosophy

HyperDrafter follows the Hyper suite's cyberpunk design language:
- **Typography**: Courier Prime typewriter font family
- **Colors**: Category-based system (green=expansion, blue=structure, red=factual, orange=logic, purple=clarity, yellow=evidence, gray=basic)
- **Themes**: Seamless dark/light mode with paper metaphor
- **Interactions**: Smooth transitions with glass morphism effects

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

## 🏗️ Architecture

### Editor Core
- **TipTap Framework**: Professional editor built on TipTap with custom extensions
- **Paragraph-based Architecture**: Each paragraph maintains unique ID with independent AI analysis
- **Real-time Feedback**: 1-second debounced analysis after typing stops
- **TipTap Marks**: Advanced highlighting system using TipTap's mark system with overlap resolution
- **Theme Management**: React context with localStorage persistence
- **Smooth Animations**: CSS transitions for paragraph selection and state changes
- **Clean Architecture**: Separation of concerns with dedicated hooks and services

### AI Integration
- **Service Layer**: Dedicated `analysisService` for AI operations with abort handling
- **Two-stage Analysis**: Efficient span identification followed by detailed feedback
- **Document Context**: Full document awareness for contextual paragraph analysis
- **Category System**: Seven distinct feedback types with priority ordering
- **Robust Parsing**: Handles AI responses with extra text and JSON formatting

### State Management
- **Custom Hooks**: Modular state management with `useEditorState`, `useAnalyzeParagraph`, and `useEditorHandlers`
- **Service Pattern**: Separate services for analysis and highlight management
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Performance**: React.memo and useMemo optimizations throughout

## 📁 Project Structure

```
HyperDrafter/
├── components/
│   ├── editor/          # Core editing components
│   │   ├── Editor.tsx   # Main editor orchestration (117 lines)
│   │   └── TipTapEditor.tsx # TipTap editor wrapper with React.memo
│   ├── sidebar/         # AI feedback interface
│   │   ├── Sidebar.tsx  # Main sidebar with paragraph indicators
│   │   └── HighlightCard.tsx # Individual feedback cards
│   └── ui/              # Shared UI components
├── lib/
│   ├── ai/              # AI integration layer
│   │   ├── anthropic.ts # Anthropic API service
│   │   └── prompts/     # AI prompts and templates
│   └── tiptap/          # TipTap extensions
│       └── extensions/  # Custom TipTap extensions
│           ├── ParagraphWithId.ts # Paragraph node with unique IDs
│           └── AIHighlight.ts     # AI highlight mark
├── services/
│   └── editor/          # Editor services
│       ├── analysisService.ts  # AI analysis operations
│       └── highlightService.ts # Highlight management
├── types/
│   └── editor.ts        # TypeScript interfaces (Paragraph, Highlight, etc.)
├── contexts/            # React contexts (theme, etc.)
└── hooks/               # Custom React hooks
    ├── useAnalyzeParagraph.ts  # AI analysis logic
    ├── useEditorState.ts       # Editor state management
    ├── useEditorHandlers.ts    # Event handlers
    └── useParagraphDebounce.ts # Debouncing logic
```

## 🎯 Current Status

HyperDrafter has a **professional core** with:
- ✅ TipTap-powered editor with custom extensions
- ✅ Paragraph-based AI analysis maintaining workflow
- ✅ Real-time AI analysis with TipTap marks for highlighting
- ✅ Modern paper-like UI with smooth animations
- ✅ Interactive sidebar with polished transitions
- ✅ Document-context aware AI feedback
- ✅ Preserved cursor positioning during paragraph selection
- ✅ Clean architecture with separated concerns
- ✅ Full TypeScript type safety
- ✅ Performance optimizations with React.memo and useMemo
- ✅ Service layer for AI and highlight management

## 🔮 Next Steps

- **Draft Management**: Auto-save and document persistence
- **Export System**: Markdown, TXT, and HTML export
- **TipTap Formatting**: Bold, italic, and text formatting extensions
- **Enhanced Node Types**: Headings, lists, blockquotes using TipTap nodes
- **Keyboard Navigation**: Streamlined highlight traversal

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8+
- **Editor**: TipTap 3.0+ with custom extensions
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI**: React 19 with custom hooks and contexts
- **AI**: Anthropic Claude integration with intelligent prompting
- **Storage**: LocalStorage for settings and draft persistence

Part of the **Hyper suite** maintaining consistent design and architecture patterns.

## 📄 License

MIT