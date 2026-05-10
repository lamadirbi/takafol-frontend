'use client';

import Button from './Button';

export default function Table({
  columns,
  /** صفوف الجدول — يمكن تمرير `data` بدلاً منها لتوافق أقدم */
  rows,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
}) {
  const list = rows ?? data ?? [];
  const totalPages = pageSize ? Math.max(1, Math.ceil((total || 0) / pageSize)) : 1;

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.04]">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/60 text-right">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 font-semibold text-muted-foreground">
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
              <tr key={row.id ?? idx} className="border-t border-slate-100 hover:bg-muted/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {page && onPageChange ? (
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
          <span className="text-xs text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          <div className="flex gap-2">
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
