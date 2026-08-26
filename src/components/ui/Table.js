'use client';

import { cn } from '@/lib/utils';
import Button from './Button';

export default function Table({
  columns,
  rows,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  empty,
  toolbar,
  className,
}) {
  const list = rows ?? data ?? [];
  const totalPages = pageSize ? Math.max(1, Math.ceil((total || 0) / pageSize)) : 1;

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border-0 bg-white shadow-sm', className)}>
      {toolbar ? (
        <div className="border-b border-black/8 px-3 py-3">{toolbar}</div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm tabular-nums">
          <thead className="text-start">
            <tr className="border-b border-black/8">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-start text-[length:var(--text-caption)] font-medium text-muted-foreground',
                    col.headerClassName ?? col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
                      aria-hidden
                    />
                    جاري التحميل…
                  </span>
                </td>
              </tr>
            ) : list?.length ? (
              list.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className="border-t border-black/8 transition-colors hover:bg-[#F0F2F5]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-2.5 align-middle', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn('px-3 py-10', empty ? 'text-center' : 'text-center text-muted-foreground')}
                >
                  {empty ?? emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {page && onPageChange ? (
        <div className="flex items-center justify-between gap-3 border-t border-black/8 px-3 py-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
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
