'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminFamilyManageModal from '@/components/admin/AdminFamilyManageModal';
import AddFamilyModal from '@/components/admin/AddFamilyModal';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { getApiErrorMessage, unwrapPaginated } from '@/lib/utils';

function formatLoginSerial(row) {
  const s = row?.login_serial ?? row?.user?.login_serial;
  if (s === undefined || s === null) return '—';
  const n = String(s).replace(/\D/g, '');
  return n.length ? n.padStart(3, '0') : String(s);
}

export default function AdminFamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);
  const { camp } = useCamp();
  const { campSlug } = useParams();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/families', {
        params: { search: debouncedSearch, per_page: pageSize, page },
      });
      const { items, total: t } = unwrapPaginated(response);
      setFamilies(items);
      setTotal(t);
    } catch (error) {
      console.error('Failed to fetch families:', error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  async function handleExcel(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/import/families-excel', fd);
      setImportMsg(
        `تم: مُنشأ ${data?.created ?? 0}، مُحدَّث ${data?.updated ?? 0}، تخطي ${data?.skipped ?? 0}.`
      );
      fetchFamilies();
    } catch (err) {
      setImportMsg(getApiErrorMessage(err, 'فشل الاستيراد.'));
    } finally {
      setImporting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/families/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchFamilies();
    } catch (err) {
      alert(getApiErrorMessage(err, 'تعذر الحذف.'));
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: 'national_id', label: 'رقم الهوية' },
    { key: 'head_name', label: 'رب الأسرة' },
    {
      key: 'login_serial',
      label: 'رقم الدخول',
      render: (row) => <span className="font-mono">{formatLoginSerial(row)}</span>,
    },
    {
      key: 'members_count',
      label: 'الأفراد',
      render: (row) => row.total_members ?? row.members?.length ?? '—',
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            onClick={() => router.push(`/${campSlug}/admin/families/${row.id}`)}
          >
            الطرود
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedFamilyId(row.id)}>
            تعديل
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(row)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="سجل العائلات" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">إدارة العائلات</h1>
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl">
              + إضافة عائلة
            </Button>
          </div>

          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">استيراد عائلات من Excel</h2>
            <p className="mt-1 text-sm text-slate-600">
              تُدرَج/تُحدَّث العائلات تلقائياً حسب رقم الهوية (الملف بدون أطفال؛ يُضافون لاحقاً من النظام).
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcel}
            />
            <Button
              type="button"
              className="mt-3 bg-emerald-600 hover:bg-emerald-700"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
            >
              {importing ? 'جاري الاستيراد…' : 'استيراد ملف Excel'}
            </Button>
            {importMsg ? <p className="mt-2 text-sm text-slate-700">{importMsg}</p> : null}
          </section>

          <div className="mb-6 w-full max-w-md">
            <label className="mb-1 block text-sm font-medium text-slate-700">بحث عن عائلة</label>
            <Input
              placeholder="رقم الهوية أو اسم رب الأسرة"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl"
            />
            <p className="mt-1 text-xs text-slate-500">البحث أثناء الكتابة ضمن القائمة المسجّلة.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={columns}
              rows={families}
              loading={loading}
              emptyMessage="لم يتم العثور على عائلات."
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </main>

        <Footer />
      </div>

      <AdminFamilyManageModal
        open={selectedFamilyId !== null}
        familyId={selectedFamilyId}
        onClose={() => setSelectedFamilyId(null)}
        onSaved={fetchFamilies}
      />

      <AddFamilyModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={fetchFamilies}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف العائلة؟"
        message={
          deleteTarget
            ? `سيتم حذف عائلة «${deleteTarget.head_name}» وربطها بالكامل. لا يمكن التراجع.`
            : ''
        }
        confirmLabel="حذف نهائي"
        cancelLabel="إلغاء"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
