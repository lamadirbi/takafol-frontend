'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Table from '@/components/ui/Table';
import PageHeading from '@/components/ui/PageHeading';
import CampFilterRecordViewModal from '@/components/admin/CampFilterRecordViewModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { cn, formatDate, getApiErrorMessage, unwrapApiList, unwrapResource } from '@/lib/utils';

function resultCount(row) {
  const snap = row?.snapshot;
  if (!snap) return '—';
  const scope = row?.criteria?.filter_scope || 'family';
  if (scope === 'members') {
    if (snap.members_count != null) return snap.members_count;
    let n = 0;
    for (const f of snap.families || []) {
      n += (f.members || []).length;
    }
    return n;
  }
  return snap.families_count ?? (snap.families || []).length ?? 0;
}

export default function CampRecordsPage() {
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRecord, setViewRecord] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { camp } = useCamp();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/camp-filter-records', {
        params: { per_page: 100 },
      });
      setRecords(unwrapApiList(response));
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/admin/camp-filter-records/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchRecords();
      if (viewRecord?.id === deleteTarget.id) {
        setViewRecord(null);
      }
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'تعذر حذف السجل.'));
    } finally {
      setDeleting(false);
    }
  };

  const openPreview = async (row) => {
    setViewLoading(true);
    try {
      const res = await api.get(`/admin/camp-filter-records/${row.id}`);
      setViewRecord(unwrapResource(res.data) ?? row);
    } catch {
      setViewRecord(row);
    } finally {
      setViewLoading(false);
    }
  };

  const actionBtn =
    'inline-flex h-10 w-32 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors';

  const columns = [
    { key: 'name', label: 'اسم السجل / الحملة' },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      className: 'min-w-[10rem] whitespace-nowrap',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'results_count',
      label: 'عدد النتائج',
      className: 'min-w-[8rem] whitespace-nowrap',
      render: (row) => resultCount(row),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`${base}/admin/camp-records/${row.id}`}
            className={cn(actionBtn, 'border border-primary bg-white text-primary hover:bg-primary/5')}
          >
            فتح السجل
          </Link>
          <button
            type="button"
            className={cn(actionBtn, 'bg-[#E4E6EB] text-foreground hover:bg-[#d8dadf] disabled:opacity-50')}
            onClick={() => openPreview(row)}
            disabled={viewLoading}
          >
            معاينة
          </button>
          <button
            type="button"
            className={cn(actionBtn, 'bg-red-50 text-red-700 hover:bg-red-100')}
            onClick={() => {
              setDeleteError('');
              setDeleteTarget(row);
            }}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="سجلات الفلترة"
      subtitle={camp?.name}
      extras={
        <>
      <CampFilterRecordViewModal
        open={Boolean(viewRecord)}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف سجل الفلترة؟"
        message={
          deleteTarget
            ? `سيتم حذف «${deleteTarget.name}» نهائياً. لا يمكن التراجع.${deleteError ? `\n\n${deleteError}` : ''}`
            : ''
        }
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
      />
        </>
      }
    >
          <PageHeading
            title="سجلات فلترة المخيم"
            description="اضغط على سجل للانتقال إلى صفحة التوزيع والاستلام أو عرّف اللقطة سريعاً."
            actions={
              <Link
                href={`${base}/admin/filter`}
                className="inline-flex min-h-11 items-center rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#166534]"
              >
                العودة للفلترة
              </Link>
            }
          />
          <Table
            columns={columns}
            rows={records}
            loading={loading}
            emptyMessage="لا توجد سجلات محفوظة حالياً."
          />
    </AdminShell>
  );
}
