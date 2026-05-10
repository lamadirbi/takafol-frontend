import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-secondary/15 text-secondary',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-primary/10 text-primary',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
