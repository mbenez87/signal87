import { AIProvider, ChatCompletionRequest, ChatCompletionResponse, GenerationRequest, GenerationResponse } from '../types/ai'
import { DEFAULT_AI_PROVIDER, getConfiguredProviders, isProviderConfigured } from '../config/ai'
import { openaiService } from './api/openai'
import { grokService } from './api/grok'
import { perplexityService } from './api/perplexity'
import { claudeService } from './api/claude'

export class LLMService {
  private currentProvider: AIProvider = DEFAULT_AI_PROVIDER

  constructor() {
    // Ensure we have at least one configured provider
    const configured = getConfiguredProviders()
    if (configured.length === 0) {
      console.warn('No AI providers configured. Please set API keys in .env file.')
    } else if (!isProviderConfigured(this.currentProvider)) {
      // If default provider is not configured, use the first configured one
      this.currentProvider = configured[0]
    }
  }

  setProvider(provider: AIProvider) {
    if (!isProviderConfigured(provider)) {
      throw new Error(`Provider ${provider} is not configured. Please add API key to .env file.`)
    }
    this.currentProvider = provider
  }

  getProvider(): AIProvider {
    return this.currentProvider
  }

  getConfiguredProviders(): AIProvider[] {
    return getConfiguredProviders()
  }

  async chat(request: ChatCompletionRequest, provider?: AIProvider): Promise<ChatCompletionResponse> {
    const selectedProvider = provider || this.currentProvider

    if (!isProviderConfigured(selectedProvider)) {
      throw new Error(`Provider ${selectedProvider} is not configured`)
    }

    try {
      switch (selectedProvider) {
        case 'openai':
          return await openaiService.chatCompletion(request)
        case 'grok':
          return await grokService.chatCompletion(request)
        case 'perplexity':
          return await perplexityService.chatCompletion(request)
        case 'claude':
          return await claudeService.chatCompletion(request)
        default:
          throw new Error(`Unknown provider: ${selectedProvider}`)
      }
    } catch (error) {
      console.error(`Error calling ${selectedProvider}:`, error)
      throw error
    }
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const provider = request.provider || this.currentProvider

    // Build the prompt with context
    let fullPrompt = request.prompt

    if (request.context) {
      fullPrompt = `Context:\n${request.context}\n\nTask:\n${request.prompt}`
    }

    if (request.documents && request.documents.length > 0) {
      fullPrompt += `\n\nRelevant Documents:\n${request.documents.join('\n\n')}`
    }

    const response = await this.chat({
      messages: [
        {
          role: 'system',
          content: 'You are Aria, an intelligent AI assistant for Signal87 AI platform. You help users analyze documents, generate reports, and extract insights. Provide comprehensive, well-structured responses.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    }, provider)

    return {
      content: response.content,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.usage?.totalTokens,
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Use OpenAI for embeddings by default
    if (!isProviderConfigured('openai')) {
      throw new Error('OpenAI must be configured for embedding generation')
    }
    return await openaiService.generateEmbedding(text)
  }

  // Multi-provider ensemble: Query multiple providers and combine responses
  async ensembleQuery(request: ChatCompletionRequest, providers?: AIProvider[]): Promise<ChatCompletionResponse[]> {
    const selectedProviders = providers || getConfiguredProviders()

    const promises = selectedProviders.map(provider =>
      this.chat(request, provider).catch(error => {
        console.error(`Error from ${provider}:`, error)
        return null
      })
    )

    const results = await Promise.all(promises)
    return results.filter((r): r is ChatCompletionResponse => r !== null)
  }

  // Best-of-N: Query multiple providers and return the best response based on length/quality
  async bestOfN(request: ChatCompletionRequest, n: number = 2): Promise<ChatCompletionResponse> {
    const configured = getConfiguredProviders()
    const providers = configured.slice(0, Math.min(n, configured.length))

    const responses = await this.ensembleQuery(request, providers)

    if (responses.length === 0) {
      throw new Error('No successful responses from any provider')
    }

    // Simple heuristic: prefer longer, more detailed responses
    return responses.reduce((best, current) =>
      current.content.length > best.content.length ? current : best
    )
  }
}

export const llmService = new LLMService()
