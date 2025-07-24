# HyperDrafter TODO

## Current Status
- ✅ Project bootstrapped with Next.js, TypeScript, and Tailwind
- ✅ Basic editor component with paragraph-based editing
- ✅ Sidebar component for AI feedback display
- ✅ Cyberpunk theme matching Hyper suite
- ✅ CLAUDE.md rules file created
- ✅ Settings modal for Anthropic API key management
- ✅ Local storage for API credentials

## In Progress - Two-Stage AI System
- [ ] Design two-stage AI system: 1) Span identification 2) Detailed analysis
- [ ] Implement span triage prompt to identify relevant text spans with character offsets
- [ ] Implement focused span analysis prompt for detailed feedback
- [ ] Create two-stage pipeline: paragraph → span identification → batch span analysis → highlights
- [ ] Build precise highlight overlay system based on character offsets
- [ ] Connect highlighted spans to specific sidebar feedback items

## High Priority
- [ ] Implement local storage persistence for drafts
- [ ] Add autosave functionality
- [ ] Create highlight click interactions
- [ ] Add keyboard navigation between highlights
- [ ] Implement export functionality (Markdown, TXT, HTML)

## Medium Priority  
- [ ] Add span persistence with local storage for tagged spans and analysis results
- [ ] Add draft management UI (save, load, delete)
- [ ] Implement user preferences system
- [ ] Add suggestion accept/dismiss functionality
- [ ] Create context menu for highlights
- [ ] Add undo/redo support

## Low Priority
- [ ] Add paragraph reordering via drag & drop
- [ ] Implement collaborative editing features
- [ ] Add themes/color customization
- [ ] Create onboarding tutorial
- [ ] Add markdown preview mode

## Bugs & Issues
- [ ] None reported yet

## Future Enhancements
- [ ] Multi-document support with tabs
- [ ] Split-screen editing
- [ ] AI writing continuation/completion
- [ ] Voice dictation support
- [ ] Plugin system for custom AI analyzers
- [ ] Real-time collaboration
- [ ] Cloud sync for drafts

## Technical Debt
- [ ] Add proper TypeScript types for highlights and feedback
- [ ] Implement proper error handling for AI analysis
- [ ] Add loading states for AI processing
- [ ] Optimize re-renders with React.memo
- [ ] Add accessibility features (ARIA labels, keyboard nav)

## Two-Stage AI System Architecture

### Stage 1: Span Triage (Fast, Lightweight)
- AI identifies specific text spans within paragraphs that need feedback
- Returns character offsets and reasoning for each span
- Optimized prompt for quick decision-making
- ~80% cost reduction compared to analyzing entire paragraphs

### Stage 2: Detailed Analysis (Focused, High-Quality) 
- AI provides detailed feedback only for identified spans
- Contextual analysis based on span type and content
- Generates actionable suggestions and improvements
- Precise feedback targeting specific text portions

### Benefits
- **Intelligent Selection**: AI decides what needs attention, not hardcoded rules
- **Cost Effective**: Only analyze meaningful content spans
- **Precise Feedback**: Highlights show exactly what needs improvement
- **Adaptive**: Can adjust criteria based on document type and context

## Notes
- Current editor uses mock AI feedback - transitioning to two-stage real AI system
- New system will provide surgical precision on feedback placement
- Performance optimization achieved through intelligent span selection
- Each highlight will map to specific character offsets for precise rendering