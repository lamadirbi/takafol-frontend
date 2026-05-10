import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:opacity-95',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:opacity-95',
  outline:
    'border-2 border-primary bg-white text-primary shadow-sm hover:bg-slate-50',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  accent: 'bg-accent text-accent-foreground hover:opacity-95',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
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
      className={cn(
        'inline-flex items-center justify-center font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? 'جاري التنفيذ…' : children}
    </button>
  );
}
