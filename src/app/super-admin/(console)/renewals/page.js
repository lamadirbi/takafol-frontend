'use client';

import { useCallback, useEffect, useState } from 'react';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import NameList from '@/components/super-admin/NameList';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatDate, getApiErrorMessage, unwrapPaginated } from '@/lib/utils';
import { useNotice } from '@/context/NoticeContext';

function statusLabel(status) {
  if (status === 'approved') return 'معتمد';
  if (status === 'rejected') return 'مرفوض';
  if (status === 'pending') return 'قيد الانتظار';
  return status || '—';
}

export default function SuperAdminRenewalsPage() {
  const showNotice = useNotice();
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRenewals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscription-renewal-requests', {
        params: { page, per_page: 20 },
      });
      const { items, total: t } = unwrapPaginated(res);
      setRenewals(items);
      setTotal(t);
    } catch {
      setRenewals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  const updateStatus = async (row, status) => {
    try {
      await api.patch(`/admin/subscription-renewal-requests/${row.id}`, { status });
      fetchRenewals();
    } catch (err) {
      showNotice(getApiErrorMessage(err, 'تعذر تحديث حالة طلب التجديد.'));
    }
  };

  return (
    <SuperAdminShell title="تجديد الاشتراك" description="اضغط اسم المخيم لعرض الإشعار">
      <NameList
        title="اسم المخيم"
        items={renewals}
        loading={loading}
        emptyMessage="لا توجد إشعارات تجديد حتى الآن."
        getId={(r) => r.id}
        getTitle={(r) => r.camp_name || 'مخيم'}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
        renderDetails={(row) => (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">تاريخ الإرسال: </span>
              {formatDate(row.created_at) || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">الحالة: </span>
              {statusLabel(row.status)}
            </p>
            {row.admin_note ? (
              <p className="whitespace-pre-wrap text-muted-foreground">{row.admin_note}</p>
            ) : null}
            <div>
              <p className="mb-2 text-xs font-semibold text-[#65676B]">صورة إشعار التحويل</p>
              {row.image_url ? (
                <a
                  href={row.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl bg-[#F0F2F5]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.image_url}
                    alt={`إشعار دفع ${row.camp_name || 'المخيم'}`}
                    className="mx-auto max-h-80 w-full object-contain"
                  />
                </a>
              ) : (
                <div className="flex min-h-32 items-center justify-center rounded-xl bg-[#F0F2F5] text-sm text-[#65676B]">
                  لا توجد صورة مرفقة مع هذا الطلب
                </div>
              )}
            </div>
            {row.status === 'pending' ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => updateStatus(row, 'approved')}>
                  اعتماد
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(row, 'rejected')}>
                  رفض
                </Button>
              </div>
            ) : null}
          </div>
        )}
      />
    </SuperAdminShell>
  );
}
