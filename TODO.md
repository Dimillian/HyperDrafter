# HyperDrafter TODO

## Current Status - Core Complete ✅
- ✅ **Stable Editor**: ContentEditable-based paragraph editor with robust text handling
- ✅ **AI Integration**: Real-time analysis with category-based highlighting system
- ✅ **Modern UI**: Paper-like editor with typewriter font and dark/light themes
- ✅ **Interactive Sidebar**: Compact paragraph indicators with expandable feedback
- ✅ **Document Context**: AI sees full document for better paragraph analysis

## High Priority - Polish & Features
- [ ] **Draft Persistence**: Auto-save to localStorage with draft management
- [ ] **Export System**: Support for Markdown, TXT, and HTML export
- [ ] **Keyboard Navigation**: Tab through highlights, arrow keys between paragraphs
- [ ] **Paragraph Types**: Support for titles, subtitles, lists, and quotes

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
- **UI Overhaul**: Transformed from basic editor to polished paper-like writing experience
- **Category Colors**: Switched from priority-based to category-based highlighting
- **Sidebar Redesign**: Compact indicators showing first 3 words with category counts
- **Theme System**: Dark/light mode with consistent paper metaphor
- **Stable Architecture**: Resolved all cursor jumping and text corruption issues