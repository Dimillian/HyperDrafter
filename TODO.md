# HyperDrafter TODO

## Current Status - TipTap Migration Complete ✅
- ✅ **TipTap Editor**: Migrated from contentEditable to professional TipTap editor framework
- ✅ **Paragraph-based Architecture**: Custom TipTap extensions maintaining AI analysis workflow
- ✅ **AI Integration**: Real-time analysis with category-based highlighting system using TipTap marks
- ✅ **Modern UI**: Paper-like editor with typewriter font and dark/light themes
- ✅ **Interactive Sidebar**: Compact paragraph indicators with expandable feedback and smooth animations
- ✅ **Document Context**: AI sees full document for better paragraph analysis
- ✅ **Smooth Animations**: Polished transitions for paragraph selection in both editor and sidebar

## High Priority - Polish & Features
- [ ] **Draft Persistence**: Auto-save to localStorage with draft management
- [ ] **Export System**: Support for Markdown, TXT, and HTML export
- [ ] **Keyboard Navigation**: Tab through highlights, arrow keys between paragraphs
- [ ] **TipTap Formatting**: Bold, italic, and other text formatting via TipTap extensions
- [ ] **Enhanced Paragraph Types**: Headings, lists, blockquotes using TipTap nodes

## Medium Priority - Enhancements
- [ ] **Suggestion Actions**: Accept/dismiss functionality for AI feedback
- [ ] **Better Error Handling**: Graceful AI failures and network issues
- [ ] **Performance**: React.memo optimization and debounced renders
- [ ] **Accessibility**: ARIA labels and screen reader support

## Low Priority - Advanced Features
- [ ] **Document Management**: Multiple documents with tabs
- [ ] **Markdown Support**: Live preview mode for markdown syntax
- [ ] **Voice Input**: Dictation support for hands-free writing
- [ ] **Collaboration**: Real-time multi-user editing

## Architectural Considerations
- **Markdown vs Current**: Current paragraph-based structure excellent for AI analysis but limits document-wide selection
- **Selection Spanning**: Would require major rework to support cross-paragraph selection
- **AI Categories**: Successfully implemented category-based colors (expansion=green, structure=blue, factual=red, logic=orange, clarity=purple, evidence=yellow, basic=gray)

## Recent Major Achievements
- **TipTap Migration**: Successfully migrated from contentEditable to professional TipTap editor framework
- **Custom Extensions**: Built ParagraphWithId and AIHighlight extensions maintaining paragraph-based AI analysis
- **Smooth Animations**: Added polished transitions for paragraph selection across editor and sidebar
- **Cursor Positioning**: Fixed cursor positioning to preserve click location during paragraph selection
- **Architecture Improvement**: Enhanced code maintainability and extensibility with TipTap's extension system
- **UI Polish**: Maintained paper-like experience with improved visual feedback and interactions