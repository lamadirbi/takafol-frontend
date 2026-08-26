'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { IconChevron } from '@/components/ui/Icons';

export default function NameList({
  title = 'الاسم',
  items = [],
  loading = false,
  emptyMessage = 'لا توجد بيانات.',
  getId,
  getTitle,
  getSubtitle,
  renderBadge,
  hrefFor,
  renderDetails,
  page,
  pageSize,
  total,
  onPageChange,
}) {
  const [openId, setOpenId] = useState(null);
  const totalPages = pageSize ? Math.max(1, Math.ceil((total || 0) / pageSize)) : 1;

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5 text-[length:var(--text-caption)] font-medium tracking-[0.12em] text-muted-foreground">
        {title}
      </div>
      {loading ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">جاري التحميل…</p>
      ) : items.length ? (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const id = getId(item);
            const name = getTitle(item);
            const subtitle = getSubtitle?.(item);
            const badge = renderBadge?.(item);
            const href = hrefFor?.(item);
            const open = openId === id;

            const body = (
              <>
                <span className="min-w-0 flex-1 text-start">
                  <span className="block font-medium">{name}</span>
                  {subtitle ? <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{subtitle}</span> : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {badge}
                  <IconChevron className={cn('h-4 w-4 text-muted-foreground transition-transform', !href && open ? '-rotate-90' : '')} />
                </span>
              </>
            );

            if (href) {
              return (
                <li key={id}>
                  <Link
                    href={href}
                    className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm text-foreground transition-colors duration-(--duration-ui) hover:bg-muted/50"
                  >
                    {body}
                  </Link>
                </li>
              );
            }

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : id)}
                  aria-expanded={open}
                  className={cn(
                    'flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-sm transition-colors duration-(--duration-ui)',
                    open ? 'bg-muted/60 text-primary' : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  {body}
                </button>
                {open && renderDetails ? (
                  <div className="border-t border-border bg-background px-4 py-4">{renderDetails(item)}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      {page && onPageChange ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
