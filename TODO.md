# HyperDrafter TODO

## Current Status
- ✅ Project bootstrapped with Next.js, TypeScript, and Tailwind
- ✅ Basic editor component with paragraph-based editing
- ✅ Sidebar component for AI feedback display
- ✅ Cyberpunk theme matching Hyper suite
- ✅ CLAUDE.md rules file created

## In Progress
- [ ] Implement real AI content analysis (currently mocked)
- [ ] Add highlight overlay system on paragraphs
- [ ] Connect highlights to sidebar feedback cards

## High Priority
- [ ] Implement local storage persistence for drafts
- [ ] Add autosave functionality
- [ ] Create highlight click interactions
- [ ] Add keyboard navigation between highlights
- [ ] Implement export functionality (Markdown, TXT, HTML)

## Medium Priority  
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

## Notes
- The editor currently uses mock AI feedback - needs integration with actual AI service
- Performance optimization needed for large documents (100+ paragraphs)
- Consider implementing virtual scrolling for better performance