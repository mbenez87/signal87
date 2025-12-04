import { AIProvider, AIServiceConfig } from '../types/ai'

// AI Provider Configuration
export const AI_CONFIG: Record<AIProvider, AIServiceConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
    baseUrl: 'https://api.openai.com/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '4096'),
    temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7'),
  },
  grok: {
    apiKey: import.meta.env.VITE_GROK_API_KEY || '',
    model: import.meta.env.VITE_GROK_MODEL || 'grok-beta',
    baseUrl: 'https://api.x.ai/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '4096'),
    temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7'),
  },
  perplexity: {
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY || '',
    model: import.meta.env.VITE_PERPLEXITY_MODEL || 'llama-3.1-sonar-large-128k-online',
    baseUrl: 'https://api.perplexity.ai',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '4096'),
    temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7'),
  },
  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
    model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '4096'),
    temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7'),
  },
}

export const DEFAULT_AI_PROVIDER: AIProvider =
  (import.meta.env.VITE_DEFAULT_AI_PROVIDER as AIProvider) || 'claude'

export const getProviderConfig = (provider: AIProvider): AIServiceConfig => {
  return AI_CONFIG[provider]
}

export const isProviderConfigured = (provider: AIProvider): boolean => {
  return !!AI_CONFIG[provider].apiKey
}

export const getConfiguredProviders = (): AIProvider[] => {
  return (Object.keys(AI_CONFIG) as AIProvider[]).filter(isProviderConfigured)
}
