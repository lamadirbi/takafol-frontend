'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import Table from '@/components/ui/Table';
import CampFilterRecordViewModal from '@/components/admin/CampFilterRecordViewModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { cn, formatDate, getApiErrorMessage, unwrapApiList } from '@/lib/utils';

function resultCount(row) {
  const snap = row?.snapshot;
  if (!snap) return '—';
  const scope = row?.criteria?.filter_scope || 'family';
  if (scope === 'members') {
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

  const columns = [
    { key: 'name', label: 'اسم السجل / الحملة' },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'results_count',
      label: 'عدد النتائج',
      render: (row) => resultCount(row),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${base}/admin/camp-records/${row.id}`}
            className={cn(
              'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-xl border-2 border-primary bg-white px-3 py-1.5 text-sm font-semibold text-primary',
              'shadow-sm transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            )}
          >
            فتح السجل
          </Link>
          <button
            type="button"
            className={cn(
              'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700',
              'shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400'
            )}
            onClick={() => setViewRecord(row)}
          >
            معاينة
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-xl border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700',
              'shadow-sm transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500'
            )}
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
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="سجلات الفلترة" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">سجلات فلترة المخيم</h1>
              <p className="mt-1 text-slate-500">
                اضغط على سجل للانتقال إلى صفحة التوزيع والاستلام أو عرّف اللقطة سريعاً.
              </p>
            </div>
            <Link
              href={`${base}/admin/filter`}
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            >
              العودة للفلترة ←
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={columns}
              rows={records}
              loading={loading}
              emptyMessage="لا توجد سجلات محفوظة حالياً."
            />
          </div>
        </main>

        <Footer />
      </div>

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
    </div>
  );
}
