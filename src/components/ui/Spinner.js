import { cn } from '@/lib/utils';

export default function Spinner({ className, label }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent',
          className
        )}
        aria-hidden="true"
      />
    </span>
  );
}
