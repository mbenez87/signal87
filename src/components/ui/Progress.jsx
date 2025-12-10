import { cn } from '../../utils/cn';

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('w-full bg-zinc-800 rounded-full h-2 overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
