import { cn } from '@/lib/utils';

const field =
  'min-h-11 w-full rounded-[var(--radius-control)] border border-border bg-control px-3 py-2.5 text-sm text-foreground transition-[border-color,background-color,box-shadow] duration-(--duration-ui) ease-(--ease-out) placeholder:text-(--ink-3) focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20';

export default function Input({
  label,
  id,
  error,
  hint,
  className,
  inputClassName,
  icon: Icon,
  ...props
}) {
  const inputId = id || props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <span className="relative flex items-center">
        {Icon ? (
          <span className="pointer-events-none absolute inset-s-3 text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            field,
            Icon ? 'ps-10' : '',
            error ? 'border-destructive focus-visible:ring-destructive/20' : '',
            inputClassName
          )}
          {...props}
        />
      </span>
      {hint && !error ? (
        <span id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
