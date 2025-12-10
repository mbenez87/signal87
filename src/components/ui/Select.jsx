import { cn } from '../../utils/cn';

export function Select({ value, onValueChange, children, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'px-4 py-2 rounded-lg',
        'bg-zinc-900 border border-zinc-800',
        'text-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
        'cursor-pointer transition-all duration-200',
        className
      )}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
