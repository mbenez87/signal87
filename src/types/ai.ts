// AI Provider Types
export type AIProvider = 'openai' | 'grok' | 'perplexity' | 'claude'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionRequest {
  messages: Message[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  content: string
  model: string
  provider: AIProvider
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
}

export interface GenerationRequest {
  prompt: string
  context?: string
  documents?: string[]
  provider?: AIProvider
}

export interface GenerationResponse {
  content: string
  provider: AIProvider
  model: string
  tokensUsed?: number
}

export interface EmbeddingRequest {
  text: string
  model?: string
}

export interface EmbeddingResponse {
  embedding: number[]
  model: string
}

export interface AIServiceConfig {
  apiKey: string
  model: string
  baseUrl?: string
  timeout?: number
  maxTokens?: number
  temperature?: number
}
