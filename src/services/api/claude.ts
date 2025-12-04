import { ChatCompletionRequest, ChatCompletionResponse, Message } from '../../types/ai'
import { getProviderConfig } from '../../config/ai'

export class ClaudeService {
  private config = getProviderConfig('claude')

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key is not configured')
    }

    // Convert messages to Claude format (extract system messages)
    const systemMessages = request.messages.filter(m => m.role === 'system')
    const conversationMessages = request.messages.filter(m => m.role !== 'system')

    const response = await fetch(`${this.config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model || this.config.model,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        system: systemMessages.length > 0 ? systemMessages[0].content : undefined,
        messages: conversationMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id,
      content: data.content[0].text,
      model: data.model,
      provider: 'claude',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      finishReason: data.stop_reason,
    }
  }
}

export const claudeService = new ClaudeService()
