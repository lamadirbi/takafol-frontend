import { cn } from '@/lib/utils';

const spines = {
  carbon: 'bg-primary',
  stamp: 'bg-destructive',
  mark: 'bg-secondary',
  warn: 'bg-warn',
  mute: 'bg-(--ink-4)',
};

export function Card({ className, children, spine, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card)] border border-black/8 bg-card text-card-foreground shadow-sm',
        spine ? 'ps-1' : null,
        className
      )}
      {...props}
    >
      {spine ? (
        <span
          aria-hidden
          className={cn('absolute inset-y-0 start-0 w-[3px]', spines[spine] || spines.carbon)}
        />
      ) : null}
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-4 pt-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={cn('text-[length:var(--text-h3)] font-semibold tracking-tight text-foreground', className)}>
      {children}
    </h2>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export function FilePanel({ spine = 'carbon', className, innerClassName, children, padded = true, ...props }) {
  return (
    <Card spine={spine} className={className} {...props}>
      <div className={cn(padded && 'px-4 py-4 ps-5', innerClassName)}>{children}</div>
    </Card>
  );
}

export function LedgerStrip({ items = [], className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-black/8 bg-card shadow-sm sm:flex',
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            'min-w-0 flex-1 px-5 py-4',
            i > 0 ? 'border-t border-border sm:border-t-0 sm:border-s' : null
          )}
        >
          <p className="text-[length:var(--text-caption)] font-medium tracking-[0.16em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1.5 text-[length:var(--text-h1)] font-semibold tabular-nums leading-none text-foreground">
            {item.value}
          </p>
          {item.hint ? <p className="mt-2 text-xs text-muted-foreground">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Stamp({ tone = 'pending', children, className }) {
  const tones = {
    received: 'text-secondary',
    pending: 'text-primary',
    not_eligible: 'text-muted-foreground',
    danger: 'text-destructive',
    warn: 'text-warn',
  };
  return (
    <span className={cn('stamp', tones[tone] || tones.pending, className)}>{children}</span>
  );
}
