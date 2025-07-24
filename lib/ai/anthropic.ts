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

  async identifySpans(paragraphText: string, fullDocumentContext?: { paragraphs: Array<{ id: string; content: string }>, targetParagraphId: string }, signal?: AbortSignal): Promise<SpanTriageResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    if (!paragraphText.trim()) {
      return { spans: [] }
    }

    const response = await fetch('/api/anthropic/messages', {
      signal,
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
      
      const parsed = JSON.parse(cleanContent)
      
      // Validate and filter spans
      const validSpans = parsed.spans?.filter((span: any) => {
        // Check if span has required properties
        if (!span.text || span.startOffset === undefined || span.endOffset === undefined) {
          return false
        }
        
        // Try to find the actual position of the span text in the paragraph
        const spanTextIndex = paragraphText.indexOf(span.text)
        if (spanTextIndex === -1) {
          // Text not found in paragraph at all
          return false
        }
        
        // Update the span with the correct offsets
        span.startOffset = spanTextIndex
        span.endOffset = spanTextIndex + span.text.length
        
        // Span validation passed
        return true
      }) || []
      
      return { spans: validSpans } as SpanTriageResponse
    } catch (e) {
      return { spans: [] }
    }
  }

}

export const anthropicService = new AnthropicService()