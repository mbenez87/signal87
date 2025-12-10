import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Folder, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { DocumentInMessage } from './DocumentInMessage';
import base44 from '../../lib/base44Client';
import { cn } from '../../utils/cn';
import { Button, Input } from '../ui';

export function FloatingAria({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load selected documents from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const selectedDocsData = localStorage.getItem('aria_selected_documents');
        if (selectedDocsData) {
          const docs = JSON.parse(selectedDocsData);
          setSelectedDocs(docs);
        }
      } catch (error) {
        console.error('Failed to load selected documents:', error);
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const detectFolderOrganization = (text) => {
    const patterns = [
      /organize?\s+(?:my\s+)?(.+?)\s+(?:into|in|to)\s+(?:a\s+)?folder\s+(?:called|named)?\s*["']?([^"']+)["']?/i,
      /create\s+(?:a\s+)?folder\s+(?:called|named)?\s*["']?([^"']+)["']?\s+(?:with|for|containing)\s+(.+)/i,
      /put\s+(?:all\s+)?(?:my\s+)?(.+?)\s+(?:into|in)\s+["']?([^"']+)["']?/i,
      /move\s+(.+?)\s+to\s+["']?([^"']+)["']?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          isOrganization: true,
          searchCriteria: match[1]?.trim(),
          folderName: match[2]?.trim()
        };
      }
    }

    return { isOrganization: false };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Check if this is a folder organization request
      const orgDetection = detectFolderOrganization(userMessage);

      if (orgDetection.isOrganization) {
        console.log('[FloatingAria] Detected folder organization request');

        const response = await base44.functions.invoke('organizeFolderWithDocuments', {
          folderName: orgDetection.folderName,
          searchCriteria: orgDetection.searchCriteria,
          workspaceId: null
        });

        if (response.success) {
          setMessages([
            ...newMessages,
            {
              role: 'assistant',
              content: `✓ ${response.message}\n\n**Folder:** ${response.folder.name}\n**Documents moved:** ${response.folder.documentCount}\n\n${response.movedDocuments.map(d => `• ${d.title}`).join('\n')}`
            }
          ]);
        } else {
          throw new Error(response.error || 'Failed to organize folder');
        }
      } else {
        // Normal chat with ARIA
        console.log('[FloatingAria] Sending chat request to ARIA');

        const response = await base44.functions.invoke('ariaChatWithCaching', {
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          user_email: null,
          user_id: null,
          use_web_search: false
        });

        if (response.answer) {
          setMessages([
            ...newMessages,
            {
              role: 'assistant',
              content: response.answer
            }
          ]);
        } else {
          throw new Error('No response from ARIA');
        }
      }
    } catch (error) {
      console.error('[FloatingAria] Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `I encountered an error: ${error.message}. Please try again.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (docId) => {
    console.log('[FloatingAria] Document clicked:', docId);
    // Navigate to document or open modal
    window.location.href = `/documents?docId=${docId}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-r from-blue-600 to-purple-600',
          'text-white shadow-lg',
          'hover:shadow-2xl hover:scale-110',
          'transition-all duration-200',
          'flex items-center justify-center',
          className
        )}
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-96 h-[600px]',
        'bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl',
        'flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">ARIA</h3>
            <p className="text-xs text-gray-400">Your AI Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Selected Documents */}
      {selectedDocs.length > 0 && (
        <div className="p-3 border-b border-zinc-800 bg-zinc-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Folder className="w-4 h-4" />
            <span>{selectedDocs.length} document(s) selected</span>
          </div>
          <div className="space-y-2">
            {selectedDocs.map((doc) => (
              <DocumentInMessage
                key={doc.id}
                document={doc}
                onViewDocument={handleDocumentClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="font-medium">Hi! I'm ARIA.</p>
            <p className="text-sm mt-1">Ask me anything about your documents.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            onDocumentClick={handleDocumentClick}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>ARIA is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask ARIA anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
