# HyperDrafter 🚀

A sophisticated AI-powered writing editor that provides intelligent feedback as you write. Built with a focus on seamless text editing and contextual AI assistance.

## ✨ Key Features

- **📝 Paper-Like Editor**: Typewriter font with elegant paper styling and dark/light themes
- **🤖 Intelligent AI Analysis**: Real-time feedback with category-based highlighting system
- **🎯 Contextual Highlights**: Seven feedback categories (expansion, structure, factual, logic, clarity, evidence, basic) with distinct colors
- **📊 Smart Sidebar**: Compact paragraph indicators showing first 3 words with expandable detailed feedback
- **🔄 Document Context**: AI analyzes each paragraph within full document context for better suggestions
- **⚡ Stable Architecture**: Robust contentEditable implementation preventing cursor jumping and text corruption

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
- **Paragraph-based**: Each paragraph is independently editable with AI analysis
- **Real-time Feedback**: 1-second debounced analysis after typing stops
- **Highlight System**: Character-offset based highlighting with overlap resolution
- **Theme Management**: React context with localStorage persistence

### AI Integration
- **Two-stage Analysis**: Efficient span identification followed by detailed feedback
- **Document Context**: Full document awareness for contextual paragraph analysis
- **Category System**: Seven distinct feedback types with priority ordering
- **Robust Parsing**: Handles AI responses with extra text and JSON formatting

## 📁 Project Structure

```
HyperDrafter/
├── components/
│   ├── editor/          # Core editing components
│   │   ├── Editor.tsx   # Main editor orchestration
│   │   └── Paragraph.tsx # Individual paragraph editing
│   ├── sidebar/         # AI feedback interface
│   │   ├── Sidebar.tsx  # Main sidebar with paragraph indicators
│   │   └── HighlightCard.tsx # Individual feedback cards
│   └── ui/              # Shared UI components
├── lib/ai/              # AI integration layer
│   ├── anthropic.ts     # Anthropic API service
│   └── prompts/         # AI prompts and templates
├── contexts/            # React contexts (theme, etc.)
└── hooks/               # Custom React hooks
```

## 🎯 Current Status

HyperDrafter has a **stable core** with:
- ✅ Robust text editing without cursor issues
- ✅ Real-time AI analysis with category-based highlights  
- ✅ Modern paper-like UI with theme switching
- ✅ Interactive sidebar with paragraph navigation
- ✅ Document-context aware AI feedback

## 🔮 Next Steps

- **Draft Management**: Auto-save and document persistence
- **Export System**: Markdown, TXT, and HTML export
- **Enhanced Paragraph Types**: Titles, lists, and formatting
- **Keyboard Navigation**: Streamlined highlight traversal

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8+
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI**: React 19 with custom hooks and contexts
- **AI**: Anthropic Claude integration with intelligent prompting
- **Storage**: LocalStorage for settings and draft persistence

Part of the **Hyper suite** maintaining consistent design and architecture patterns.

## 📄 License

MIT