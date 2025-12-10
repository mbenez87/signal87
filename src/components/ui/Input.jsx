import { cn } from '../../utils/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-4 py-2 rounded-lg',
        'bg-zinc-900 border border-zinc-800',
        'text-white placeholder-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
}
