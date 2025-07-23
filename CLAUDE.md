# HyperDrafter Rules

HyperDrafter is a collaborative AI-powered editor that provides live feedback as you write. It's designed to help users draft content at insane speed with intelligent AI assistance through highlights, suggestions, and real-time feedback.

## Development Rules

### TODO.md Management
CRITICAL: You MUST update TODO.md whenever:
- Starting or completing a feature
- Discovering new requirements or edge cases
- Finding bugs that need to be tracked
- Priorities change based on user feedback
- New tasks are identified during development

The TODO.md file is the single source of truth for project tasks and progress.

## Development Commands

Always run these commands after making changes:

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
npm run typecheck  # Run TypeScript type checking
```

IMPORTANT: Always run `npm run typecheck` after modifications to ensure code quality and fix any errors and run the typecheck again.

## Environment Setup

### Required Dependencies
- Next.js 15.3.5+
- React 19.1.0+
- TypeScript 5.8.3+
- Tailwind CSS 3.4.17+

### Key Features

1. **Paragraph-based Editing**: Each paragraph is a separate component for optimal performance
2. **Debounced AI Analysis**: Content analyzed after user stops typing for 1 second
3. **Interactive Highlights**: Click highlights to see detailed feedback in sidebar
4. **Real-time Feedback**: AI suggestions appear as user writes
5. **Draft Persistence**: Automatic saving to local storage

## Important Development Guidelines

### Theme
HyperDrafter follows the Hyper suite cyberpunk design language:

- **Primary Colors**: Purple shades (#a855f7, #c084fc, #7c3aed)
- **Background**: Dark theme (#000000, #0a0a0a, #111111)
- **Glass Effects**: backdrop-blur with transparent backgrounds
- **Animations**: Glow effects, shimmer, and smooth transitions

### Component Patterns
- Glass morphism for cards and overlays
- Neon purple glow on active elements
- Smooth 200-300ms transitions
- Custom purple scrollbars
