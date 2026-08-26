import { cn } from '@/lib/utils';

const variants = {
  error: 'border-destructive/30 bg-(--stamp-fill) text-destructive',
  success: 'border-secondary/30 bg-(--mark-fill) text-secondary',
  warning: 'border-warn/30 bg-(--warn-fill) text-warn',
  info: 'border-border bg-muted text-foreground',
};

export default function Alert({ variant = 'error', children, className }) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-[var(--radius-control)] border px-3 py-2 text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </p>
  );
}
