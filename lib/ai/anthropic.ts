import { SpanTriageResponse, AnthropicModel, ModelsResponse } from './types'
import { buildSpanTriagePrompt } from './prompts/span-triage'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODELS_URL = 'https://api.anthropic.com/v1/models'

export class AnthropicService {
  private apiKey: string | null = null
  private model: AnthropicModel = 'claude-3-5-haiku-20241022'

  constructor() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('anthropic_api_key')
      this.model = (localStorage.getItem('anthropic_model') as AnthropicModel) || 'claude-3-5-haiku-20241022'
    }
  }

  updateCredentials() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('anthropic_api_key')
      this.model = (localStorage.getItem('anthropic_model') as AnthropicModel) || 'claude-3-5-haiku-20241022'
    }
  }

  async fetchAvailableModels(): Promise<ModelsResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const response = await fetch('/api/anthropic/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to fetch models: ${response.status}`)
    }

    const data = await response.json()
    return data as ModelsResponse
  }

  async identifySpans(paragraphText: string, fullDocumentContext?: { paragraphs: Array<{ id: string; content: string }>, targetParagraphId: string }): Promise<SpanTriageResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    if (!paragraphText.trim()) {
      return { spans: [] }
    }

    const response = await fetch('/api/anthropic/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: buildSpanTriagePrompt(paragraphText, fullDocumentContext)
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    try {
      // Clean the content before parsing
      let cleanContent = content.trim()
      
      // Extract only the JSON part - look for the first { and find its matching }
      const startIndex = cleanContent.indexOf('{')
      if (startIndex === -1) {
        console.error('No JSON object found in response')
        return { spans: [] }
      }
      
      let braceCount = 0
      let endIndex = -1
      
      for (let i = startIndex; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') {
          braceCount++
        } else if (cleanContent[i] === '}') {
          braceCount--
          if (braceCount === 0) {
            endIndex = i + 1
            break
          }
        }
      }
      
      if (endIndex === -1) {
        console.error('Malformed JSON - no closing brace found')
        return { spans: [] }
      }
      
      // Extract just the JSON portion
      cleanContent = cleanContent.substring(startIndex, endIndex)
      
      // Remove any potential control characters and fix common JSON issues
      cleanContent = cleanContent
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/"/g, '"') // Fix smart quotes
        .replace(/"/g, '"') // Fix smart quotes
      
      console.log('AI Response for text:', paragraphText)
      console.log('Raw content:', content)
      console.log('Extracted JSON:', cleanContent)
      
      const parsed = JSON.parse(cleanContent)
      console.log('Parsed spans:', parsed.spans)
      
      // Validate and filter spans
      const validSpans = parsed.spans?.filter((span: any) => {
        // Check if span has required properties
        if (!span.text || span.startOffset === undefined || span.endOffset === undefined) {
          console.warn('Invalid span missing required properties:', span)
          return false
        }
        
        // Check if offsets are valid numbers
        if (typeof span.startOffset !== 'number' || typeof span.endOffset !== 'number') {
          console.warn('Invalid span offsets (not numbers):', span)
          return false
        }
        
        // Check if offsets are within text bounds
        if (span.startOffset < 0 || span.endOffset > paragraphText.length) {
          console.warn('Span offsets out of bounds:', span, 'Text length:', paragraphText.length)
          return false
        }
        
        // Check if start is before end
        if (span.startOffset >= span.endOffset) {
          console.warn('Invalid span: start >= end:', span)
          return false
        }
        
        // Check if extracted text matches - use fuzzy matching to handle AI offset errors
        const extractedText = paragraphText.slice(span.startOffset, span.endOffset)
        if (extractedText !== span.text) {
          // Try to find the span text within a reasonable range (±5 characters)
          let foundMatch = false
          let correctedStart = span.startOffset
          let correctedEnd = span.endOffset
          
          for (let startAdjust = -5; startAdjust <= 5 && !foundMatch; startAdjust++) {
            for (let endAdjust = -5; endAdjust <= 5 && !foundMatch; endAdjust++) {
              const testStart = Math.max(0, span.startOffset + startAdjust)
              const testEnd = Math.min(paragraphText.length, span.endOffset + endAdjust)
              const testText = paragraphText.slice(testStart, testEnd)
              
              if (testText === span.text) {
                foundMatch = true
                correctedStart = testStart
                correctedEnd = testEnd
                console.log('Auto-corrected offsets for:', JSON.stringify(span.text), { original: [span.startOffset, span.endOffset], corrected: [testStart, testEnd] })
                // Update the span with corrected offsets
                span.startOffset = correctedStart
                span.endOffset = correctedEnd
              }
            }
          }
          
          if (!foundMatch) {
            console.warn('Span text mismatch. Expected:', JSON.stringify(extractedText), 'Got:', JSON.stringify(span.text))
            console.warn('Could not find fuzzy match within ±5 character range')
            return false
          }
        }
        
        // Span validation passed
        return true
      }) || []
      
      console.log('Valid spans after filtering:', validSpans)
      return { spans: validSpans } as SpanTriageResponse
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return { spans: [] }
    }
  }

}

export const anthropicService = new AnthropicService()