export const SPAN_ANALYSIS_PROMPT = `You are an expert writing assistant providing detailed, actionable feedback on a specific text span that has been identified as needing improvement.

Context (full paragraph):
"{{CONTEXT}}"

Problematic span:
"{{SPAN}}"

Issue type: {{ISSUE_TYPE}}
Initial reasoning: {{REASONING}}

Provide comprehensive feedback that includes:

1. **Detailed Explanation**: Why is this problematic? What specific issues does it create for the reader?

2. **Suggested Revisions**: Provide 2-3 alternative ways to rewrite this span. Each suggestion should:
   - Address the identified issue
   - Maintain the author's voice and intent
   - Fit naturally within the paragraph context

3. **Writing Principle**: What general writing principle or rule applies here? This helps the writer learn and avoid similar issues.

4. **Severity Assessment**: Rate the importance of fixing this issue:
   - Low: Minor improvement, optional
   - Medium: Noticeable improvement, recommended
   - High: Significant issue, should be fixed

Format your response as JSON:
{
  "explanation": "Detailed explanation of the issue",
  "suggestions": [
    {
      "text": "First suggested revision",
      "rationale": "Why this revision works"
    },
    {
      "text": "Second suggested revision",
      "rationale": "Why this revision works"
    }
  ],
  "principle": "General writing principle that applies",
  "severity": "low|medium|high"
}`

export function buildSpanAnalysisPrompt(
  context: string,
  span: string,
  issueType: string,
  reasoning: string
): string {
  return SPAN_ANALYSIS_PROMPT
    .replace('{{CONTEXT}}', context)
    .replace('{{SPAN}}', span)
    .replace('{{ISSUE_TYPE}}', issueType)
    .replace('{{REASONING}}', reasoning)
}