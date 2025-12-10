import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '../../utils/cn';

export function MessageBubble({ message, onDocumentClick }) {
  const isUser = message.role === 'user';

  // Custom link renderer to handle doc:// protocol
  const components = {
    a: ({ node, href, children, ...props }) => {
      if (href?.startsWith('doc://')) {
        const docId = href.replace('doc://', '');
        return (
          <button
            onClick={() => onDocumentClick?.(docId)}
            className="text-blue-400 hover:text-blue-300 underline"
            {...props}
          >
            {children}
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline" {...props}>
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    code: ({ node, inline, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-zinc-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-600 pl-4 italic my-3 text-gray-300">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg p-4',
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-white text-zinc-900 shadow-lg'
        )}
      >
        <ReactMarkdown components={components}>
          {message.content}
        </ReactMarkdown>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
