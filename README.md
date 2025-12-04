# Signal87 AI Platform

Enterprise Document Intelligence powered by Multi-LLM AI

## 🚀 Features

- **Multi-LLM Integration**: Powered by OpenAI GPT-4, xAI Grok, Perplexity AI, and Anthropic Claude
- **Aria AI Assistant**: Intelligent assistant for document management and analysis
- **Generation Dashboard**: AI-powered report generation from documents
- **Provider Selection**: Choose between multiple AI providers for different use cases
- **Dark Theme**: Modern, professional interface

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite for blazing fast builds
- Tailwind CSS for styling
- Multiple LLM providers (OpenAI, Grok, Perplexity, Claude)

## 🔧 Development

```bash
npm install
npm run dev
```

## 🌐 Deployment

Deployed on Vercel: https://signal87.vercel.app/

## 🔑 Environment Variables

Required environment variables (add to Vercel):

```
VITE_OPENAI_API_KEY
VITE_GROK_API_KEY
VITE_PERPLEXITY_API_KEY
VITE_CLAUDE_API_KEY
VITE_DEFAULT_AI_PROVIDER
```

See `.env.example` for full list of configuration options.
