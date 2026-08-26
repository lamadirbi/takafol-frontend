import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function EmptyState({ title, description, action, className }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white px-6 py-10 text-center shadow-sm',
        className
      )}
    >
      {title ? <h3 className="text-[length:var(--text-h3)] font-semibold text-foreground">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageSpinner({ label = 'جاري التحميل' }) {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="h-8 w-8 text-primary" label={label} />
    </div>
  );
}
