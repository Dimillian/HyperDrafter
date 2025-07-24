export const SPAN_TRIAGE_PROMPT = `You are an intelligent writing assistant that identifies specific text spans needing improvement. Analyze the following paragraph and identify ONLY the most important spans that would benefit from feedback.

Paragraph to analyze:
"{{TEXT}}"

Identify specific text spans that have issues with:
- Grammar errors or awkward phrasing
- Clarity issues (ambiguous or confusing)
- Style improvements (wordiness, passive voice, repetition)
- Structure problems (flow, transitions)
- Factual accuracy concerns
- Tone inconsistencies

For each span you identify:
1. Extract the EXACT text (must match character-for-character)
2. Calculate the character offset where it starts (0-indexed)
3. Calculate the character offset where it ends
4. Categorize the issue type
5. Rate your confidence (0.0-1.0)
6. Provide brief reasoning

Be selective - only flag spans that genuinely need attention. Ignore minor issues unless they significantly impact readability.

Respond with valid JSON in this exact format:
{
  "spans": [
    {
      "text": "exact text from the paragraph",
      "startOffset": 0,
      "endOffset": 10,
      "type": "grammar|clarity|style|structure|factual|tone",
      "confidence": 0.85,
      "reasoning": "Brief explanation"
    }
  ]
}

If no significant issues are found, return: {"spans": []}`

export function buildSpanTriagePrompt(text: string): string {
  return SPAN_TRIAGE_PROMPT.replace('{{TEXT}}', text)
}