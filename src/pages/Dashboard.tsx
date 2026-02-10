import { useMemo, useState } from 'react'
import {
  BarChart3,
  Bot,
  ChevronRight,
  CircuitBoard,
  FileText,
  FolderOpen,
  Home,
  LayoutGrid,
  Lock,
  LogOut,
  MessageSquare,
  Paperclip,
  ScanSearch,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  User,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import { cn } from '../utils/cn'

type DuplicateCluster = {
  id: string
  canonicalId: string
  title: string
  confidence: number
  intelligenceScore: number
  status: 'watch' | 'review' | 'approved'
  domain: string
  classificationPath: string
  modalities: string[]
  findings: string[]
  lastObserved: string
}

export default function Dashboard() {
  const [ariaOpen, setAriaOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm Aria, your AI assistant. I can help you upload documents, organize files, search for information, apply signatures, and much more. What would you like to do?",
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [activeTab, setActiveTab] = useState('dedupe')
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const primarySidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'generate', icon: Wand2, label: 'Generate' },
    { id: 'dedupe', icon: ScanSearch, label: 'Duplicate Detector' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'compliance', icon: Shield, label: 'Compliance' },
    { id: 'folders', icon: FolderOpen, label: 'Folders' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'team', icon: User, label: 'Team' },
  ]

  const secondarySidebarItems = [
    { id: 'workspace', icon: LayoutGrid, label: 'Workspace' },
    { id: 'network', icon: CircuitBoard, label: 'Network' },
  ]

  const mockDocuments = [
    {
      id: 1,
      title: 'Q4 Financial Report.pdf',
      category: 'Financial',
      date: '2024-03-15',
      size: '2.4 MB',
      thumbnail:
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=260&fit=crop',
    },
    {
      id: 2,
      title: 'Vendor Contract - ACME Corp.pdf',
      category: 'Legal',
      date: '2024-03-10',
      size: '1.1 MB',
      thumbnail:
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=260&fit=crop',
    },
    {
      id: 3,
      title: 'Employee Handbook 2024.pdf',
      category: 'HR',
      date: '2024-03-05',
      size: '3.8 MB',
      thumbnail:
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=260&fit=crop',
    },
    {
      id: 4,
      title: 'Technical Specification.pdf',
      category: 'Technical',
      date: '2024-03-01',
      size: '856 KB',
      thumbnail:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=260&fit=crop',
    },
    {
      id: 5,
      title: 'Marketing Strategy Deck.pdf',
      category: 'Marketing',
      date: '2024-02-28',
      size: '4.2 MB',
      thumbnail:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=260&fit=crop',
    },
    {
      id: 6,
      title: 'Annual Budget 2024.pdf',
      category: 'Financial',
      date: '2024-02-25',
      size: '1.8 MB',
      thumbnail:
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200&h=260&fit=crop',
    },
  ]

  const duplicateClusters: DuplicateCluster[] = [
    {
      id: 'C-104',
      canonicalId: 'DOC-9331',
      title: 'FY24 Procurement Briefing',
      confidence: 0.96,
      intelligenceScore: 91,
      status: 'review',
      domain: 'Oracle + SharePoint',
      classificationPath: 'Secret → Top Secret',
      modalities: ['text', 'tables', 'embedded images'],
      findings: [
        'Near-identical narrative with 3.1% lexical variance',
        'Financial table cell permutations detected',
        'Embedded image OCR aligns with canonical references',
      ],
      lastObserved: '2026-01-31 22:11Z',
    },
    {
      id: 'C-098',
      canonicalId: 'DOC-9010',
      title: 'Cross-domain ISR Summary',
      confidence: 0.89,
      intelligenceScore: 84,
      status: 'watch',
      domain: 'IBM DMS',
      classificationPath: 'Top Secret (same level)',
      modalities: ['text', 'imagery', 'binary'],
      findings: [
        'Transformer embeddings indicate semantic rewrite',
        'Imagery pHash overlap > 94%',
        'Binary attachment metadata has divergent originator controls',
      ],
      lastObserved: '2026-02-01 04:25Z',
    },
    {
      id: 'C-112',
      canonicalId: 'DOC-9540',
      title: 'Multilingual Budget Annex',
      confidence: 0.93,
      intelligenceScore: 88,
      status: 'approved',
      domain: 'SharePoint + Legacy DMS',
      classificationPath: 'Secret (same level)',
      modalities: ['multilingual text', 'tables', 'financial binary'],
      findings: [
        'English/Arabic/Spanish semantic equivalence clustered',
        'Temporal diff confirms rolling revision lineage',
        'No data movement; only index pointers persisted',
      ],
      lastObserved: '2026-02-03 19:08Z',
    },
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setChatMessages((prev) => [...prev, { role: 'user', content: inputMessage }])
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I understand you want to: "${inputMessage}". I can help with that! In a full implementation, I would process this request and perform the necessary actions across the platform.`,
        },
      ])
    }, 1000)
    setInputMessage('')
  }

  const handleGenerate = () => {
    if (!generationPrompt.trim()) return
    console.log('Generating with prompt:', generationPrompt)
  }

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const filteredDocuments = mockDocuments.filter((doc) => {
    if (!trimmedQuery) return true
    return [doc.title, doc.category, doc.date, doc.size].some((value) =>
      value.toLowerCase().includes(trimmedQuery),
    )
  })

  const duplicateStats = useMemo(() => {
    const reviewQueue = duplicateClusters.filter((cluster) => cluster.status !== 'approved').length
    const avgIntelligence = Math.round(
      duplicateClusters.reduce((sum, cluster) => sum + cluster.intelligenceScore, 0) /
        duplicateClusters.length,
    )

    return {
      clusters: duplicateClusters.length,
      reviewQueue,
      avgIntelligence,
      auditEvents: '17,944/day',
    }
  }, [duplicateClusters])

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-[58px] bg-[#030303] border-r border-zinc-900 flex flex-col items-center py-3 gap-3">
        <div className="w-9 h-9 rounded-md bg-zinc-100 text-black font-bold text-[11px] flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">
          S87
        </div>

        <div className="w-9 h-px bg-zinc-800" />

        <nav className="flex-1 flex flex-col items-center gap-2">
          {primarySidebarItems.map((item) => (
            <button
              key={item.id}
              title={item.label}
              aria-label={item.label}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'h-8 w-8 rounded-md border transition-all duration-200 flex items-center justify-center',
                activeTab === item.id
                  ? 'bg-zinc-800/90 border-zinc-500 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/80',
              )}
            >
              <item.icon className="w-[15px] h-[15px]" />
            </button>
          ))}

          <div className="w-9 h-px bg-zinc-800 my-1" />

          {secondarySidebarItems.map((item) => (
            <button
              key={item.id}
              title={item.label}
              aria-label={item.label}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'h-8 w-8 rounded-md border transition-all duration-200 flex items-center justify-center',
                activeTab === item.id
                  ? 'bg-zinc-800/90 border-zinc-500 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/80',
              )}
            >
              <item.icon className="w-[15px] h-[15px]" />
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <button
            title="Settings"
            aria-label="Settings"
            className="h-8 w-8 rounded-md border border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/80 flex items-center justify-center transition-all duration-200"
          >
            <Settings className="w-[15px] h-[15px]" />
          </button>
          <button
            title="Sign Out"
            aria-label="Sign Out"
            className="h-8 w-8 rounded-md border border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/80 flex items-center justify-center transition-all duration-200"
          >
            <LogOut className="w-[15px] h-[15px]" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, Commander</h1>
            <p className="text-gray-400 text-sm mt-1">Aria is monitoring ingestion, scoring, and policy guardrails.</p>
          </div>
          <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:border-blue-600 transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dedupe' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-gray-400">Open Clusters</p>
                  <p className="text-2xl font-bold text-white mt-2">{duplicateStats.clusters}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-gray-400">Review Queue</p>
                  <p className="text-2xl font-bold text-amber-400 mt-2">{duplicateStats.reviewQueue}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-gray-400">Avg Intelligence Score</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">{duplicateStats.avgIntelligence}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-gray-400">Audit Events</p>
                  <p className="text-2xl font-bold text-purple-400 mt-2">{duplicateStats.auditEvents}</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Non-intrusive duplicate detection overlay</h2>
                <p className="text-sm text-gray-300">
                  Connectors index content in place across SharePoint, Oracle, IBM, and existing DMS repositories. The
                  detector stores only signatures, embeddings, policy metadata, and immutable audit logs—never source
                  copies.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {[
                    'Cross-domain dedupe for Secret and Top Secret with origination control gates',
                    'Multimodal understanding: text, tables, embedded images, imagery, and binary files',
                    'Temporal lineage tracking to detect drift and near-duplicates over time',
                  ].map((item) => (
                    <div key={item} className="bg-black/40 border border-zinc-800 rounded-lg p-4 text-sm text-gray-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Duplicate intelligence queue</h3>
                  <span className="text-xs text-gray-400">Guardrails: deterministic policy engine + probabilistic ML checks</span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {duplicateClusters.map((cluster) => (
                    <div key={cluster.id} className="p-6 hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-400">{cluster.id} · Canonical {cluster.canonicalId}</p>
                          <h4 className="text-white font-semibold mt-1">{cluster.title}</h4>
                          <p className="text-xs text-gray-400 mt-2">{cluster.domain} · {cluster.classificationPath}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Confidence</p>
                          <p className="text-lg font-semibold text-blue-400">{Math.round(cluster.confidence * 100)}%</p>
                          <p className="text-xs text-gray-400">Intelligence {cluster.intelligenceScore}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {cluster.modalities.map((modality) => (
                          <span key={modality} className="px-2.5 py-1 rounded-full text-xs bg-zinc-800 text-gray-300 border border-zinc-700">
                            {modality}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-4 space-y-2 text-sm text-gray-300">
                        {cluster.findings.map((finding) => (
                          <li key={finding} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800 text-xs text-gray-400">
                        <span>Last observed: {cluster.lastObserved}</span>
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Full action log enabled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Generation Dashboard</h2>
                <p className="text-gray-300 mb-4">Describe what you need and Aria will orchestrate retrieval, synthesis, and secure report generation.</p>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300">Powered by Aria AI</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    placeholder="Generate a compliance synopsis from all vendor contracts uploaded this quarter"
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleGenerate}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

              {filteredDocuments.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-gray-400">
                  <p className="text-sm">No documents match "{searchQuery}".</p>
                  <p className="text-xs mt-2">Try a different keyword or clear the search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="group cursor-pointer">
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
                          <h3 className="font-medium text-white text-sm truncate group-hover:text-blue-400 transition-colors">{doc.title}</h3>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{doc.size}</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {!ariaOpen && (
        <button
          onClick={() => setAriaOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center group hover:scale-110 z-50"
        >
          <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
        </button>
      )}

      {ariaOpen && (
        <div className="fixed bottom-8 right-8 w-[480px] h-[600px] bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-zinc-800">
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
            <button onClick={() => setAriaOpen(false)} className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-3', msg.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-zinc-800 text-white')}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 hover:bg-zinc-800 rounded-full flex items-center justify-center transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Aria anything..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleSendMessage} className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Aria can perform actions, analyze documents, and help you throughout the platform</p>
          </div>
        </div>
      )}
    </div>
  )
}
