import { useState } from 'react'
import { Bot, FileText, FolderOpen, Search, Upload, Settings, LogOut, Home,
  Shield, BarChart3, X, Send, Sparkles, Paperclip, ChevronRight, Wand2, Loader2
} from 'lucide-react'
import { cn } from '../utils/cn'
import { llmService } from '../services/llm'
import { AIProvider } from '../types/ai'

export default function Dashboard() {
  const [ariaOpen, setAriaOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant' as const,
      content: 'Hi! I\'m Aria, your AI assistant. I can help you upload documents, organize files, search for information, apply signatures, and much more. What would you like to do?'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [activeTab, setActiveTab] = useState('generate')
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generationResult, setGenerationResult] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(llmService.getProvider())
  const [availableProviders] = useState<AIProvider[]>(llmService.getConfiguredProviders())

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'generate', icon: Wand2, label: 'Generate', highlight: true },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'folders', icon: FolderOpen, label: 'Folders' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'compliance', icon: Shield, label: 'Compliance' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const mockDocuments = [
    {
      id: 1,
      title: 'Q4 Financial Report.pdf',
      category: 'Financial',
      date: '2024-03-15',
      size: '2.4 MB',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=260&fit=crop'
    },
    {
      id: 2,
      title: 'Vendor Contract - ACME Corp.pdf',
      category: 'Legal',
      date: '2024-03-10',
      size: '1.1 MB',
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=260&fit=crop'
    },
    {
      id: 3,
      title: 'Employee Handbook 2024.pdf',
      category: 'HR',
      date: '2024-03-05',
      size: '3.8 MB',
      thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=260&fit=crop'
    },
    {
      id: 4,
      title: 'Technical Specification.pdf',
      category: 'Technical',
      date: '2024-03-01',
      size: '856 KB',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=260&fit=crop'
    },
    {
      id: 5,
      title: 'Marketing Strategy Deck.pdf',
      category: 'Marketing',
      date: '2024-02-28',
      size: '4.2 MB',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=260&fit=crop'
    },
    {
      id: 6,
      title: 'Annual Budget 2024.pdf',
      category: 'Financial',
      date: '2024-02-25',
      size: '1.8 MB',
      thumbnail: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200&h=260&fit=crop'
    },
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage
    setInputMessage('')
    setChatMessages(prev => [...prev, { role: 'user' as const, content: userMessage }])
    setIsLoading(true)

    try {
      const response = await llmService.chat({
        messages: [
          {
            role: 'system',
            content: 'You are Aria, an intelligent AI assistant for Signal87 AI platform. You help users with document management, analysis, and insights. Be helpful, concise, and professional.'
          },
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ]
      }, selectedProvider)

      setChatMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: response.content
      }])
    } catch (error) {
      console.error('Error calling AI:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!generationPrompt.trim() || isLoading) return

    setIsLoading(true)
    setGenerationResult('')

    try {
      const response = await llmService.generate({
        prompt: generationPrompt,
        provider: selectedProvider
      })

      setGenerationResult(response.content)
    } catch (error) {
      console.error('Error generating:', error)
      setGenerationResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S87</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Signal87
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                activeTab === item.id
                  ? item.highlight
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-zinc-800 text-white'
                  : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'generate' ? 'Search and generate reports from your documents' : 'Manage your documents and insights'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg w-80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Generation Dashboard (Grok-style) */}
          {activeTab === 'generate' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Generate Reports & Insights</h2>
                <p className="text-gray-400">Search your documents and generate comprehensive reports powered by AI</p>
              </div>

              {/* Generation Input */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <textarea
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="What would you like to generate? e.g., 'Create a summary of all Q4 financial reports' or 'Generate a compliance report from vendor contracts'"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Powered by Aria AI</span>
                    </div>
                    {availableProviders.length > 0 && (
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                        className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableProviders.map(provider => (
                          <option key={provider} value={provider}>
                            {provider.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !generationPrompt.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generation Result */}
              {generationResult && (
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Generated Result</h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap">{generationResult}</p>
                  </div>
                </div>
              )}

              {/* Suggested Prompts */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Suggested Prompts</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Summarize all financial documents from Q4',
                    'Generate compliance report for vendor contracts',
                    'Create executive summary from board meeting notes',
                    'Analyze budget trends across all departments',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGenerationPrompt(prompt)}
                      className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left hover:border-blue-600 transition-colors group"
                    >
                      <p className="text-sm text-white group-hover:text-blue-400">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents View (Dropbox-style) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
                <select className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Categories</option>
                  <option>Financial</option>
                  <option>Legal</option>
                  <option>HR</option>
                  <option>Technical</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mockDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="group cursor-pointer"
                  >
                    {/* Dropbox-style Thumbnail */}
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20">
                      <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                        <img
                          src={doc.thumbnail}
                          alt={doc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                          {doc.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{doc.size}</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Total Documents</h3>
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white">1,247</p>
                <p className="text-sm text-gray-400 mt-2">+23 this month</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Storage Used</h3>
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white">24.8 GB</p>
                <p className="text-sm text-gray-400 mt-2">of 100 GB</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">AI Insights</h3>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-white">89</p>
                <p className="text-sm text-gray-400 mt-2">Generated this week</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Aria Button */}
      {!ariaOpen && (
        <button
          onClick={() => setAriaOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center group hover:scale-110 z-50"
        >
          <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></span>
        </button>
      )}

      {/* Aria Chat Panel */}
      {ariaOpen && (
        <div className="fixed bottom-8 right-8 w-[480px] h-[600px] bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-zinc-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Aria</h3>
                <p className="text-xs text-white/80">Your AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setAriaOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-zinc-800 text-white'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <p className="text-sm text-gray-400">Aria is thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 hover:bg-zinc-800 rounded-full flex items-center justify-center transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Aria anything..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Aria can perform actions, analyze documents, and help you throughout the platform
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
