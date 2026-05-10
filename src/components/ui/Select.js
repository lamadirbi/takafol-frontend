import { cn } from '@/lib/utils';

export default function Select({ label, id, error, className, options = [], placeholder, ...props }) {
  const selectId = id || props.name;

  return (
    <label className={cn('flex flex-col gap-1.5 w-full', className)} htmlFor={selectId}>
      {label ? (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          error ? 'border-red-500' : ''
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
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
