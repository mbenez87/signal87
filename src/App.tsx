import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, WorkspaceProvider, UploadProvider } from './contexts'
import { FloatingAria } from './components/ai'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

// Placeholder pages - to be implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-gray-400 mt-4">This page is under construction</p>
    </div>
  </div>
)

// Mock auth provider for development
const mockAuth = {
  getUser: async () => ({ email: 'demo@signal87.ai', full_name: 'Demo User', role: 'user' }),
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider auth={mockAuth}>
        <WorkspaceProvider>
          <UploadProvider>
            <Router>
              <div className="min-h-screen bg-black text-white">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
                  <Route path="/upload" element={<PlaceholderPage title="Upload" />} />
                  <Route path="/chat" element={<PlaceholderPage title="Chat" />} />
                  <Route path="/generate" element={<PlaceholderPage title="Generate" />} />
                  <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
                  <Route path="/folder/:folderId" element={<PlaceholderPage title="Folder View" />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Floating ARIA assistant available on all pages */}
                <FloatingAria />
              </div>
            </Router>
          </UploadProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
