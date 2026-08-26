import { cn } from '@/lib/utils';

export default function Select({ label, id, error, className, options = [], placeholder, ...props }) {
  const selectId = id || props.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          'min-h-11 w-full rounded-[var(--radius-control)] border border-border bg-control px-3 py-2.5 text-sm text-foreground transition-[border-color,background-color] duration-(--duration-ui) ease-(--ease-out) focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20',
          error ? 'border-destructive' : ''
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
