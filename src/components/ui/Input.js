import { cn } from '@/lib/utils';

export default function Input({
  label,
  id,
  error,
  className,
  inputClassName,
  icon: Icon,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <label className={cn('flex flex-col gap-1.5 w-full', className)} htmlFor={inputId}>
      {label ? (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      ) : null}
      <span className="relative flex items-center">
        {Icon ? (
          <span className="pointer-events-none absolute start-3 text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            Icon ? 'ps-10' : '',
            error ? 'border-red-500 focus:ring-red-200' : '',
            inputClassName
          )}
          {...props}
        />
      </span>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
