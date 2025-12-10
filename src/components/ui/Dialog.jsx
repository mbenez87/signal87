import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEffect } from 'react';

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Dialog */}
      <div className="relative z-50 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogContent({ children, className }) {
  return (
    <div className={cn(
      'bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl',
      'w-full max-w-2xl',
      'p-6',
      className
    )}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }) {
  return (
    <h2 className={cn('text-2xl font-bold text-white', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className }) {
  return (
    <p className={cn('text-gray-400 mt-2', className)}>
      {children}
    </p>
  );
}

export function DialogClose({ onClose, className }) {
  return (
    <button
      onClick={onClose}
      className={cn(
        'absolute top-4 right-4 p-2 rounded-lg',
        'text-gray-400 hover:text-white hover:bg-zinc-800',
        'transition-colors',
        className
      )}
    >
      <X className="w-5 h-5" />
    </button>
  );
}
