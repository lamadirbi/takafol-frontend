import { cn } from '@/lib/utils';

export default function Textarea({
  label,
  id,
  error,
  hint,
  className,
  textareaClassName,
  rows = 4,
  ...props
}) {
  const areaId = id || props.name;
  const errorId = error && areaId ? `${areaId}-error` : undefined;
  const hintId = hint && areaId ? `${areaId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={areaId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-24 w-full rounded-[var(--radius-control)] border border-border bg-control px-3 py-2.5 text-sm text-foreground transition-[border-color,background-color] duration-(--duration-ui) ease-(--ease-out) placeholder:text-(--ink-3) focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
          error ? 'border-destructive focus-visible:ring-destructive/20' : '',
          textareaClassName
        )}
        {...props}
      />
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
