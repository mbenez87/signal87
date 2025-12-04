import { ChatCompletionRequest, ChatCompletionResponse } from '../../types/ai'
import { getProviderConfig } from '../../config/ai'

export class GrokService {
  private config = getProviderConfig('grok')

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('Grok API key is not configured')
    }

    // xAI Grok API uses OpenAI-compatible endpoints
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Grok API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id || `grok-${Date.now()}`,
      content: data.choices[0].message.content,
      model: data.model || this.config.model,
      provider: 'grok',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      finishReason: data.choices[0].finish_reason,
    }
  }
}

export const grokService = new GrokService()
