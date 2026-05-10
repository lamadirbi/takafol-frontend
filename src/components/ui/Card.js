import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('p-4 pb-0', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)}>{children}</h2>;
}

export function CardContent({ className, children }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
