import { FileText, Heart } from 'lucide-react';
import { useState } from 'react';
import base44 from '../../lib/base44Client';
import { cn } from '../../utils/cn';

export function DocumentInMessage({ document, onViewDocument }) {
  const [isFavorite, setIsFavorite] = useState(document?.is_favorited || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (isUpdating) return;

    setIsUpdating(true);
    const newFavoriteState = !isFavorite;

    try {
      await base44.entities.Document.update(document.id, {
        is_favorited: newFavoriteState
      });
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!document) return null;

  return (
    <div
      onClick={() => onViewDocument?.(document.id)}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-blue-600 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{document.title}</h4>
            <p className="text-sm text-gray-400 mt-1">
              {document.category || 'Uncategorized'} • {document.file_type?.toUpperCase() || 'Unknown'}
            </p>
            {document.ai_summary && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {document.ai_summary}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={toggleFavorite}
          disabled={isUpdating}
          className={cn(
            'flex-shrink-0 p-2 rounded-lg transition-all',
            isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-400',
            isUpdating && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
        </button>
      </div>
    </div>
  );
}
