import { ChatCompletionRequest, ChatCompletionResponse } from '../../types/ai'
import { getProviderConfig } from '../../config/ai'

export class PerplexityService {
  private config = getProviderConfig('perplexity')

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('Perplexity API key is not configured')
    }

    // Perplexity uses OpenAI-compatible API
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
      throw new Error(`Perplexity API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id,
      content: data.choices[0].message.content,
      model: data.model,
      provider: 'perplexity',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      finishReason: data.choices[0].finish_reason,
    }
  }

  // Perplexity excels at search-augmented responses
  async searchCompletion(query: string, searchFocus?: 'web' | 'academic' | 'news'): Promise<ChatCompletionResponse> {
    const systemMessage = searchFocus
      ? `You are a helpful assistant with access to real-time ${searchFocus} information.`
      : 'You are a helpful assistant with access to real-time web information.'

    return this.chatCompletion({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: query }
      ]
    })
  }
}

export const perplexityService = new PerplexityService()
