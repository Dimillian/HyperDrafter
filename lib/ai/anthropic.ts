import { SpanTriageResponse, AnthropicModel, ModelsResponse } from './types'
import { buildSpanTriagePrompt } from './prompts/span-triage'

// Helper function to try parsing partial JSON and extract valid spans
export function tryParsePartialSpans(partialContent: string): any[] {
  try {
    // Look for the start of spans array
    const spansStartMatch = partialContent.match(/"spans"\s*:\s*\[/)
    if (!spansStartMatch) {
      return []
    }
    
    const spansStartIndex = spansStartMatch.index! + spansStartMatch[0].length
    const spanContent = partialContent.slice(spansStartIndex)
    
    // Try to extract spans even if incomplete
    const spans: any[] = []
    let currentPos = 0
    let braceDepth = 0
    let currentSpan = ''
    let inString = false
    let escaped = false
    
    for (let i = 0; i < spanContent.length; i++) {
      const char = spanContent[i]
      
      if (escaped) {
        currentSpan += char
        escaped = false
        continue
      }
      
      if (char === '\\' && inString) {
        escaped = true
        currentSpan += char
        continue
      }
      
      if (char === '"') {
        inString = !inString
        currentSpan += char
        continue
      }
      
      if (inString) {
        currentSpan += char
        continue
      }
      
      if (char === '{') {
        if (braceDepth === 0) {
          currentSpan = '{'
        } else {
          currentSpan += char
        }
        braceDepth++
      } else if (char === '}') {
        currentSpan += char
        braceDepth--
        
        if (braceDepth === 0) {
          // Try to parse complete span
          try {
            const span = JSON.parse(currentSpan)
            if (span.text && span.startOffset !== undefined && span.endOffset !== undefined) {
              spans.push(span)
            }
          } catch (e) {
            // Skip invalid spans
          }
          currentSpan = ''
        }
      } else if (braceDepth > 0) {
        currentSpan += char
      }
      
      // Stop if we hit array end
      if (char === ']' && braceDepth === 0) {
        break
      }
    }
    
    return spans
  } catch (e) {
    return []
  }
}

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

  async identifySpans(
    paragraphText: string, 
    fullDocumentContext?: { paragraphs: Array<{ id: string; content: string }>, targetParagraphId: string }, 
    signal?: AbortSignal,
    onPartialUpdate?: (partialContent: string) => void
  ): Promise<SpanTriageResponse> {
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
        stream: true,
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

    // Handle streaming response
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    let content = ''
    const decoder = new TextDecoder()

    try {
      while (true) {
        // Check if operation was cancelled
        if (signal?.aborted) {
          throw new Error('Analysis cancelled')
        }

        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                content += parsed.delta.text
                
                // Call partial update callback with current content
                if (onPartialUpdate) {
                  onPartialUpdate(content)
                }
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

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
        
        // Check if offsets are valid numbers
        if (typeof span.startOffset !== 'number' || typeof span.endOffset !== 'number') {
          return false
        }
        
        // Check if offsets are within text bounds
        if (span.startOffset < 0 || span.endOffset > paragraphText.length) {
          return false
        }
        
        // Check if start is before end
        if (span.startOffset >= span.endOffset) {
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
                // Update the span with corrected offsets
                span.startOffset = correctedStart
                span.endOffset = correctedEnd
              }
            }
          }
          
          if (!foundMatch) {
            return false
          }
        }
        
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