export const SPAN_TRIAGE_PROMPT = `You are a thoughtful writing coach that helps writers think more deeply about their ideas and improve the structure of their arguments. Focus on high-value feedback that helps the writer develop their thinking, not basic proofreading.

{{DOCUMENT_CONTEXT}}

**TARGET PARAGRAPH TO ANALYZE:**
"{{TEXT}}"

Identify specific text spans in the TARGET PARAGRAPH that would benefit from deeper thinking or structural improvement. Consider how this paragraph fits within the broader document context:

**HIGH PRIORITY (focus on these first):**
- **Expansion opportunities**: Vague claims, unsupported statements, or ideas that need more development
- **Structural issues**: Poor flow, missing transitions, illogical organization
- **Factual concerns**: Questionable claims, missing evidence, or assertions that need support
- **Logic gaps**: Conclusions that don't follow from premises, missing steps in reasoning

**MEDIUM PRIORITY:**
- **Clarity problems**: Genuinely confusing or ambiguous statements that impede understanding
- **Evidence gaps**: Claims that would benefit from examples, data, or citations

**LOW PRIORITY (only flag if no higher-priority issues exist):**
- **Basic issues**: Grammar, spelling, or simple style problems

For each span you identify:
1. Extract the EXACT text (must match character-for-character, including spaces and punctuation)
2. Calculate character offsets by counting each character manually:
   - startOffset: Count from position 0 to where your span begins
   - endOffset: Count from position 0 to where your span ends (exclusive)
   - Example: In "Hello world", "world" starts at position 6 and ends at position 11
   - CRITICAL: Verify by checking that text.slice(startOffset, endOffset) === your extracted text
3. Categorize: expansion, structure, factual, logic, clarity, evidence, or basic
4. Set priority: high, medium, or low  
5. Rate your confidence (0.0-1.0)
6. Provide reasoning that helps the writer think deeper

CRITICAL VALIDATION: Before submitting each span, manually verify:
- Count every character (including spaces, periods, commas) from the start
- Your extracted text must exactly equal the slice from startOffset to endOffset
- No overlapping spans - each character should only be in one span
Be selective and focus on spans that genuinely help the writer improve their thinking and argumentation.

Respond with valid JSON in this exact format. IMPORTANT: Escape any quotes or special characters in the reasoning field:
{
  "spans": [
    {
      "text": "exact text from the paragraph",
      "startOffset": 0,
      "endOffset": 10,
      "type": "expansion|structure|factual|logic|clarity|evidence|basic",
      "priority": "high|medium|low",
      "confidence": 0.85,
      "reasoning": "Question or insight that helps the writer think deeper (escape quotes with backslash)"
    }
  ]
}

CRITICAL: 
- Use only standard ASCII quotes (")
- Escape any quotes in text or reasoning with \"
- Do not include line breaks in reasoning text
- Keep reasoning under 100 characters

If no significant issues are found, return: {"spans": []}`

export function buildSpanTriagePrompt(text: string, fullDocumentContext?: { paragraphs: Array<{ id: string; content: string }>, targetParagraphId: string }): string {
  let prompt = SPAN_TRIAGE_PROMPT
  
  // Build document context
  let documentContextSection = ''
  if (fullDocumentContext && fullDocumentContext.paragraphs.length > 1) {
    const nonEmptyParagraphs = fullDocumentContext.paragraphs.filter(p => p.content.trim())
    
    if (nonEmptyParagraphs.length > 1) {
      documentContextSection = `**FULL DOCUMENT CONTEXT:**
${nonEmptyParagraphs.map((p, index) => {
  const isTarget = p.id === fullDocumentContext.targetParagraphId
  const marker = isTarget ? '>>> TARGET PARAGRAPH <<<' : `Paragraph ${index + 1}`
  return `${marker}:\n"${p.content}"`
}).join('\n\n')}

When analyzing the target paragraph, consider:
- How it connects to preceding and following paragraphs
- Whether it advances the overall argument or narrative
- If transitions are smooth and logical
- Whether it introduces ideas that need support from other paragraphs
- If it repeats or contradicts information elsewhere in the document

`
    }
  }
  
  return prompt
    .replace('{{DOCUMENT_CONTEXT}}', documentContextSection)
    .replace('{{TEXT}}', text)
}