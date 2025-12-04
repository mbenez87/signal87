import { useNavigate } from 'react-router-dom'
import { Bot, FileText, Shield, Zap, Brain, Lock, Search, TrendingUp, Wand2 } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Bot,
      title: 'Aria AI Orchestrator',
      description: 'Your autonomous platform agent with full operational authority—executing tasks, managing workflows, and coordinating all platform capabilities.'
    },
    {
      icon: Wand2,
      title: 'Generation Dashboard',
      description: 'Grok-style interface to search documents and generate comprehensive reports with AI.'
    },
    {
      icon: FileText,
      title: 'Document Intelligence',
      description: 'Advanced AI analyzes content, extracts insights, and builds knowledge graphs from your documents.'
    },
    {
      icon: Shield,
      title: 'Federal Compliance',
      description: 'NIST RMF, DoD classification levels, and audit trails built for government and enterprise.'
    },
    {
      icon: Brain,
      title: 'Knowledge Graph',
      description: 'Automatic entity extraction and relationship mapping across your entire document corpus.'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Classification levels, access control, encryption, and comprehensive audit logging.'
    },
    {
      icon: Search,
      title: 'Semantic Search',
      description: 'Vector-powered search finds documents by meaning, not just keywords.'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Budget forecasting, risk scoring, and trend analysis powered by AI.'
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S87</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Signal87 AI
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-200 font-medium"
            >
              Launch Platform
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-zinc-800 border border-zinc-700 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Bot className="w-4 h-4" />
            <span>Powered by Aria - Your AI Agent</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent leading-tight">
            Enterprise Document Intelligence
            <br />
            Powered by AI
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Signal87 AI transforms how you manage, analyze, and act on documents. Meet Aria, your autonomous platform orchestrator with full operational authority—executing actions, coordinating workflows, and managing every aspect of your document intelligence operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl hover:shadow-blue-600/50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
            <button
              className="px-8 py-4 bg-zinc-800 text-white rounded-lg text-lg font-semibold border-2 border-zinc-700 hover:border-blue-600 transition-all duration-200"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Powerful Capabilities</h2>
          <p className="text-xl text-gray-400">Everything you need for intelligent document management</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aria Spotlight */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Bot className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Meet Aria</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Aria isn't a chatbot or assistant—she's your platform's operating system. With full operational authority and autonomous execution capabilities, Aria orchestrates all platform functions: document processing, report generation, signature application, compliance enforcement, and workflow automation. She doesn't suggest—she executes.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Omnipresent</h4>
                <p className="text-sm opacity-90">Access Aria from anywhere in the platform with a single click</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Autonomous Execution</h4>
                <p className="text-sm opacity-90">Aria operates with full platform authority, executing operations directly with no hand-holding required</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Context-Aware</h4>
                <p className="text-sm opacity-90">Understands your documents, workflows, and organizational needs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6 text-white">Ready to transform your document workflow?</h2>
        <p className="text-xl text-gray-400 mb-8">Join organizations using Signal87 AI for intelligent document management</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl hover:shadow-blue-600/50 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Signal87 AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
