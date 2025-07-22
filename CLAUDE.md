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

## Architecture

### Core Components

#### Editor System
- `Editor.tsx`: Main editor component with paragraph management
- `Paragraph.tsx`: Individual paragraph component with highlight support
- `EditorContext.tsx`: Global editor state management
- `useEditor.ts`: Editor operations hook

#### AI Feedback System  
- `Sidebar.tsx`: AI feedback sidebar with notes and suggestions
- `Highlight.tsx`: Highlight overlay component
- `AIAnalyzer.ts`: Content analysis and highlight generation
- `FeedbackCard.tsx`: Individual feedback card component

#### Draft Management
- `DraftManager.tsx`: Draft saving/loading interface
- `DraftList.tsx`: List of saved drafts
- `AutoSave.ts`: Automatic draft saving logic

### Key Features

1. **Paragraph-based Editing**: Each paragraph is a separate component for optimal performance
2. **Debounced AI Analysis**: Content analyzed after user stops typing for 1 second
3. **Interactive Highlights**: Click highlights to see detailed feedback in sidebar
4. **Real-time Feedback**: AI suggestions appear as user writes
5. **Draft Persistence**: Automatic saving to local storage

## Important Development Guidelines

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS update TODO.md when making progress on features, finding bugs, or discovering new requirements.

## Design System

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

## Editor-Specific Considerations

### Performance
- Virtualize paragraph list for documents with 100+ paragraphs
- Debounce AI analysis to prevent excessive API calls
- Use React.memo for paragraph components
- Implement lazy loading for sidebar feedback

### Content Analysis
- Analyze only visible paragraphs + buffer
- Cache analysis results to avoid re-processing
- Queue analysis requests to prevent overload
- Prioritize analysis based on cursor position

### Highlight Management
- Use CSS-in-JS for dynamic highlight positioning
- Batch highlight updates for performance
- Clear stale highlights after content changes
- Support overlapping highlights with z-index management

## AI Integration Guidelines

### Analysis Triggers
1. User stops typing for 1 second (debounced)
2. Manual analysis request via button
3. On paragraph completion (Enter key)
4. On focus change between paragraphs

### Feedback Types
- **Grammar**: Spelling, punctuation, sentence structure
- **Style**: Tone, clarity, conciseness suggestions  
- **Content**: Expansion opportunities, missing context
- **Questions**: Unclear passages that need clarification
- **Structure**: Paragraph organization, flow improvements

### User Interaction
- Click highlight to focus sidebar note
- Hover for quick preview tooltip
- Right-click for context menu
- Keyboard shortcuts for navigation

## Keyboard Shortcuts

```
Cmd/Ctrl + S: Save draft
Cmd/Ctrl + Enter: Analyze current paragraph
Cmd/Ctrl + /: Toggle AI sidebar
Cmd/Ctrl + .: Accept suggestion
Cmd/Ctrl + ,: Dismiss suggestion
Tab: Navigate to next highlight
Shift + Tab: Navigate to previous highlight
```

## Export Functionality

Support multiple export formats:
- Markdown (.md)
- Plain text (.txt)
- HTML with styling
- PDF (future)
- Copy to clipboard with formatting

## Development Workflow

1. Always check TODO.md before starting work
2. Update TODO.md when discovering new tasks
3. Run typecheck before committing
4. Test with various document sizes
5. Ensure highlights persist across sessions
6. Verify AI feedback appears within 2 seconds

## Testing Considerations

- Test with documents of varying lengths (1-1000 paragraphs)
- Verify highlight accuracy after edits
- Test sidebar scrolling to active highlight
- Ensure draft saving works reliably
- Test AI analysis queue under load
- Verify keyboard navigation works properly

Remember: HyperDrafter is about speed and intelligence. Every feature should help users write faster and better.