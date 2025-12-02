import { useState } from 'react'
import {  Bot, FileText, FolderOpen, Search, Upload, Settings, LogOut, Home,
  Shield, BarChart3, X, Send, Sparkles, Paperclip, ChevronRight
} from 'lucide-react'
import { cn } from '../utils/cn'

export default function Dashboard() {
  const [ariaOpen, setAriaOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Aria, your AI assistant. I can help you upload documents, organize files, search for information, apply signatures, and much more. What would you like to do?'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [activeTab, setActiveTab] = useState('documents')

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
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
      title: 'Q4 Financial Report',
      category: 'Financial',
      date: '2024-03-15',
      size: '2.4 MB',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Vendor Contract - ACME Corp',
      category: 'Legal',
      date: '2024-03-10',
      size: '1.1 MB',
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Employee Handbook 2024',
      category: 'HR',
      date: '2024-03-05',
      size: '3.8 MB',
      thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Technical Specification',
      category: 'Technical',
      date: '2024-03-01',
      size: '856 KB',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Marketing Strategy Deck',
      category: 'Marketing',
      date: '2024-02-28',
      size: '4.2 MB',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }])

    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I understand you want to: "${inputMessage}". I can help with that! In a full implementation, I would process this request and perform the necessary actions across the platform.`
      }])
    }, 1000)

    setInputMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S87</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your documents and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Documents</h2>
                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Categories</option>
                  <option>Financial</option>
                  <option>Legal</option>
                  <option>HR</option>
                  <option>Technical</option>
                </select>
              </div>

              <div className="grid gap-4">
                {mockDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Document Thumbnail */}
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={doc.thumbnail}
                          alt={doc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {doc.title}
                        </h3>
                        <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                            {doc.category}
                          </span>
                          <span>{doc.date}</span>
                          <span>{doc.size}</span>
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500">85% analyzed</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-start">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Total Documents</h3>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold">1,247</p>
                <p className="text-sm text-gray-500 mt-2">+23 this month</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Storage Used</h3>
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold">24.8 GB</p>
                <p className="text-sm text-gray-500 mt-2">of 100 GB</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">AI Insights</h3>
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold">89</p>
                <p className="text-sm text-gray-500 mt-2">Generated this week</p>
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
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Aria Chat Panel */}
      {ariaOpen && (
        <div className="fixed bottom-8 right-8 w-[480px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl flex items-center justify-between">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Aria anything..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Aria can perform actions, analyze documents, and help you throughout the platform
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
