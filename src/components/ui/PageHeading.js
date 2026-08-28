import { cn } from '@/lib/utils';

export default function PageHeading({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[length:var(--text-h3)] font-semibold tracking-tight text-foreground sm:text-[length:var(--text-h1)]">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? (
        <div className="order-first flex w-full flex-col gap-2 sm:order-none sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
