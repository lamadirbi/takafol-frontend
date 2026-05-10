'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import ChangeRequestPayloadDetails from '@/components/shared/ChangeRequestPayloadDetails';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { formatDate, getApiErrorMessage, unwrapPaginated } from '@/lib/utils';

function statusLabel(s) {
  if (s === 'pending') return 'قيد المراجعة';
  if (s === 'approved') return 'مقبول';
  if (s === 'rejected') return 'مرفوض';
  if (s === 'cancelled') return 'ملغى';
  return s || '—';
}

function statusVariant(s) {
  if (s === 'pending') return 'warning';
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  return 'default';
}

export default function AdminChangeRequestsPage() {
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const { camp } = useCamp();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 30;
  const [filterStatus, setFilterStatus] = useState('');

  const [actionRow, setActionRow] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/change-requests', {
        params: { page, per_page: pageSize, ...(filterStatus ? { status: filterStatus } : {}) },
      });
      const { items: rows, total: t } = unwrapPaginated(res);
      setItems(rows);
      setTotal(t);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitAction() {
    if (!actionRow || !actionType) return;
    setSubmitting(true);
    try {
      const path =
        actionType === 'approve'
          ? `/admin/change-requests/${actionRow.id}/approve`
          : `/admin/change-requests/${actionRow.id}/reject`;
      await api.post(path, { review_note: note.trim() || undefined });
      setActionRow(null);
      setActionType(null);
      setNote('');
      load();
    } catch (e) {
      alert(getApiErrorMessage(e, 'تعذر تنفيذ الإجراء.'));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'الرقم',
      render: (row) => <span className="font-mono text-xs">#{row.id}</span>,
    },
    {
      key: 'family',
      label: 'العائلة',
      render: (row) => (
        <div>
          {row.family_id ? (
            <Link
              href={`${base}/admin/families/${row.family_id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.family?.head_name || `عائلة #${row.family_id}`}
            </Link>
          ) : (
            <p className="font-medium text-slate-900">{row.family?.head_name || '—'}</p>
          )}
          <p className="font-mono text-xs text-slate-500">{row.family?.national_id ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (row) => <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'created_at',
      label: 'تاريخ الطلب',
      render: (row) => (row.created_at ? formatDate(row.created_at) : '—'),
    },
    {
      key: 'requested_changes',
      label: 'التعديلات المطلوبة',
      render: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDetailsRow(row)}
        >
          عرض التعديلات
        </Button>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setNote('');
                setActionRow(row);
                setActionType('approve');
              }}
            >
              قبول
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700"
              onClick={() => {
                setNote('');
                setActionRow(row);
                setActionType('reject');
              }}
            >
              رفض
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="طلبات تعديل بيانات العائلات" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">طلبات التعديل</h1>
              <p className="mt-1 text-sm text-slate-600">
                طلبات رب الأسرة لتعديل البيانات؛ راجع ثم اقبل أو ارفض. عند القبول تُطبَّق التعديلات على السجل.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-slate-700">
                تصفية:
                <select
                  className="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">الكل</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={columns}
              rows={items}
              loading={loading}
              emptyMessage="لا توجد طلبات."
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>

        </main>

        <Footer />
      </div>

      <Modal
        open={Boolean(detailsRow)}
        title={detailsRow ? `تفاصيل طلب التعديل #${detailsRow.id}` : ''}
        onClose={() => setDetailsRow(null)}
        className="max-w-2xl"
      >
        {detailsRow ? (
          <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <ChangeRequestPayloadDetails payload={detailsRow.payload} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(actionRow && actionType)}
        title={actionType === 'approve' ? 'قبول طلب التعديل؟' : 'رفض طلب التعديل؟'}
        message={
          actionRow ? (
            <div className="space-y-3">
              <p>
                العائلة: <strong>{actionRow.family?.head_name || `#${actionRow.family_id}`}</strong>
              </p>
              <label className="block text-sm">
                ملاحظة للعائلة (اختياري)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="تظهر للعائلة عند الرد"
                />
              </label>
            </div>
          ) : (
            ''
          )
        }
        confirmLabel={actionType === 'approve' ? 'قبول وتطبيق' : 'تأكيد الرفض'}
        cancelLabel="إلغاء"
        danger={actionType === 'reject'}
        loading={submitting}
        onConfirm={submitAction}
        onClose={() => {
          if (!submitting) {
            setActionRow(null);
            setActionType(null);
            setNote('');
          }
        }}
      />
    </div>
  );
}
