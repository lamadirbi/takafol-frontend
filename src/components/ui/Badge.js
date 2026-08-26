import { cn } from '@/lib/utils';

const variants = {
  default: 'border-border bg-muted text-muted-foreground',
  success: 'border-secondary/30 bg-(--mark-fill) text-secondary',
  warning: 'border-warn/30 bg-(--warn-fill) text-warn',
  danger: 'border-destructive/30 bg-(--stamp-fill) text-destructive',
  info: 'border-primary/30 bg-primary/10 text-primary',
  primary: 'border-primary/30 bg-primary/10 text-primary',
  secondary: 'border-secondary/30 bg-(--mark-fill) text-secondary',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center whitespace-nowrap border border-current/25 px-2 py-0.5 text-[length:var(--text-caption)] font-medium tracking-wide',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
