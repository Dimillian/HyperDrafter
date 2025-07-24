export interface SpanIdentification {
  text: string
  startOffset: number
  endOffset: number
  type: 'expansion' | 'structure' | 'factual' | 'clarity' | 'logic' | 'evidence' | 'basic'
  priority: 'high' | 'medium' | 'low'
  confidence: number
  reasoning: string
}

export interface SpanTriageResponse {
  spans: SpanIdentification[]
}

export interface DetailedFeedback {
  spanId: string
  suggestion: string
  explanation: string
  examples?: string[]
  severity: 'low' | 'medium' | 'high'
}

export type AnthropicModel = string

export interface ModelInfo {
  id: string
  display_name: string
  created_at: string
  type: 'model'
}

export interface ModelsResponse {
  data: ModelInfo[]
  first_id?: string
  last_id?: string
  has_more: boolean
}