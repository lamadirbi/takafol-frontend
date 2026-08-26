import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-(--carbon-deep) active:bg-(--carbon-deep)',
  secondary:
    'bg-secondary text-secondary-foreground hover:brightness-[0.94] active:brightness-[0.9]',
  outline:
    'border-0 bg-[#E4E6EB] text-foreground hover:bg-[#d8dadf] active:bg-[#cfd2d7]',
  ghost: 'bg-transparent text-primary hover:bg-muted active:bg-muted',
  accent: 'bg-accent text-accent-foreground hover:brightness-110',
  danger:
    'bg-destructive text-destructive-foreground hover:brightness-[0.94] active:brightness-[0.9]',
};

const sizes = {
  sm: 'min-h-11 px-3 text-sm rounded-[var(--radius-control)]',
  md: 'min-h-11 px-4 text-sm rounded-[var(--radius-control)]',
  lg: 'min-h-11 px-5 text-[length:var(--text-h4)] rounded-[var(--radius-control)]',
  xl: 'min-h-12 px-6 text-[length:var(--text-h4)] rounded-[var(--radius-control)]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,border-color,opacity,filter] duration-(--duration-press) ease-(--ease-out) active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>جاري التنفيذ…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
