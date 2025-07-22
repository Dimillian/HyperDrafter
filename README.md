# HyperDrafter 🚀

A collaborative AI-powered editor that provides live feedback as you write. HyperDrafter enhances your writing experience with intelligent highlights, suggestions, and real-time assistance.

## Overview

HyperDrafter is a modern text editor that combines the simplicity of traditional writing tools with the power of AI assistance. As you type, the AI analyzes your content and provides contextual feedback through highlights and sidebar notes.

### Key Features

- **Live AI Feedback**: Get real-time suggestions and corrections as you write
- **Smart Highlights**: AI highlights questions, grammar issues, and areas for expansion
- **Interactive Sidebar**: Click on highlights to see detailed notes and suggestions
- **Paragraph-based Editing**: Clean, distraction-free writing with automatic paragraph creation
- **Real-time Collaboration**: Seamless interaction between human creativity and AI assistance

## How It Works

1. **Write**: Start typing in the clean, minimal editor interface
2. **Pause**: When you stop typing, the AI analyzes your text
3. **Review**: See highlights appear on relevant portions of your text
4. **Interact**: Click highlights to view AI suggestions in the sidebar
5. **Refine**: Query the AI, edit suggestions, or mark feedback as resolved

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **UI Components**: React 19
- **Icons**: Lucide React
- **AI Integration**: Real-time text analysis and feedback system

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
HyperDrafter/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── editor/      # Editor-specific components
│   ├── sidebar/     # Sidebar and notes components
│   └── ui/          # Shared UI components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## Design Philosophy

HyperDrafter follows a cyberpunk-inspired design language with:
- Dark backgrounds with neon purple accents
- Glass morphism effects for UI elements
- Smooth transitions and hover states
- Minimal, distraction-free writing interface

## Contributing

Part of the Hyper suite of tools, including HyperYapper and HyperGit. Maintains consistent design patterns and tech stack across all projects.

## License

MIT
