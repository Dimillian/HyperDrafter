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

  async identifySpans(paragraphText: string): Promise<SpanTriageResponse> {
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
            content: buildSpanTriagePrompt(paragraphText)
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
      const parsed = JSON.parse(content)
      return parsed as SpanTriageResponse
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return { spans: [] }
    }
  }

}

export const anthropicService = new AnthropicService()