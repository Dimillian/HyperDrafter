# HyperDrafter TODO

## Current Status
- ✅ Project bootstrapped with Next.js, TypeScript, and Tailwind
- ✅ Basic editor component with paragraph-based editing
- ✅ Sidebar component for AI feedback display
- ✅ Cyberpunk theme matching Hyper suite
- ✅ CLAUDE.md rules file created
- ✅ Settings modal for Anthropic API key management
- ✅ Local storage for API credentials
- ✅ Dynamic model selection from Anthropic API
- ✅ Stage 1 AI integration: Span identification with character offsets
- ✅ Real-time AI analysis with debouncing
- ✅ API routes for CORS-free Anthropic API access
- ✅ Prompts organized in dedicated files for maintainability
- ✅ Simplified contentEditable editor with unified typing/highlighting
- ✅ Full document context in AI analysis for better feedback
- ✅ Robust JSON parsing handling AI responses with extra text
- ✅ Fixed cursor jumping issues during AI analysis
- ✅ Text duplication prevention with highlight validation
- ✅ Overlapping highlight handling prioritizing longer spans

## Completed - Editor Core Functionality
- [x] Design two-stage AI system: 1) Span identification 2) Detailed analysis
- [x] Implement span triage prompt to identify relevant text spans with character offsets
- [x] Create two-stage pipeline: paragraph → span identification → batch span analysis → highlights
- [x] Build precise highlight overlay system based on character offsets
- [x] Connect highlighted spans to specific sidebar feedback items
- [x] Fixed complex textarea/overlay approach causing cursor issues
- [x] Implemented single contentEditable approach for seamless editing
- [x] Added document-wide context for AI analysis
- [x] Prevented race conditions causing text corruption
- [x] Added comprehensive highlight validation and overlap resolution

## High Priority
- [x] Create highlight click interactions
- [ ] Implement local storage persistence for drafts
- [ ] Add autosave functionality
- [ ] Add keyboard navigation between highlights
- [ ] Implement export functionality (Markdown, TXT, HTML)
- [ ] Add different paragraph types (title, subtitle, bullet points)

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
- [x] ✅ Fixed cursor jumping to analyzed paragraphs when typing elsewhere
- [x] ✅ Fixed text duplication when AI highlights were applied to edited content
- [x] ✅ Fixed contentEditable innerHTML corruption during typing
- [x] ✅ Fixed infinite render loops from useEffect dependencies
- [x] ✅ Fixed AI JSON parsing failures with extra response text
- [x] ✅ Fixed overlapping highlights causing text corruption

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
- ✅ Successfully integrated real AI feedback using Anthropic API
- ✅ Stage 1 (span triage) is fully operational with visual highlights
- ✅ Editor completely rebuilt for stability and simplicity
- ✅ Document-context aware AI analysis provides better feedback
- ✅ All major text editing bugs resolved
- Performance optimization achieved through intelligent span selection
- Each highlight maps to specific character offsets for precise rendering
- Ready for paragraph types and enhanced features

## Recent Major Improvements (Latest Session)
- **Simplified Architecture**: Replaced complex textarea/overlay with single contentEditable
- **Document Context**: AI now sees full document when analyzing paragraphs
- **Robust Parsing**: Handles AI responses with extra text after JSON
- **Race Condition Fixes**: Prevents cursor jumping and text corruption
- **Highlight Validation**: Comprehensive validation prevents text duplication
- **Overlap Resolution**: Prioritizes longer highlights when spans overlap