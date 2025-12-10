import { cn } from '../../utils/cn';

export function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    secondary: 'bg-zinc-800 text-gray-300 border-zinc-700',
    success: 'bg-green-600/20 text-green-400 border-green-600/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    danger: 'bg-red-600/20 text-red-400 border-red-600/30'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
