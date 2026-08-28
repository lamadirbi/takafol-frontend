'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { IconPlus, IconSearch, IconDownload, IconClose } from '@/components/ui/Icons';
import FamilyProfileLink from '@/components/admin/FamilyProfileLink';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useNotice } from '@/context/NoticeContext';
import { getApiErrorMessage, unwrapPaginated, downloadBlobFromResponse } from '@/lib/utils';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { adminGuideHref, adminGuideSections } from '@/components/guide/adminGuide';

const AdminFamilyManageModal = dynamic(() => import('@/components/admin/AdminFamilyManageModal'), {
  ssr: false,
});
const AddFamilyModal = dynamic(() => import('@/components/admin/AddFamilyModal'), {
  ssr: false,
});

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
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);
  const { camp } = useCamp();
  const showNotice = useNotice();
  const { campSlug } = useParams();

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

  function clearSearch() {
    setSearch('');
    setPage(1);
  }

  async function downloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const res = await api.get('/admin/import/families-excel-template', { responseType: 'blob' });
      downloadBlobFromResponse(res, 'نموذج-استيراد-العائلات.xlsx');
    } catch (err) {
      showNotice(getApiErrorMessage(err, 'تعذر تنزيل النموذج.'));
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleExcel(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    setImportMsg('جاري الاستيراد… الملف الكبير ممكن يحتاج دقيقة أو أكتر. خلّي الصفحة مفتوحة.');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/import/families-excel', fd, { timeout: 300000 });
      const created = data?.created ?? 0;
      const updated = data?.updated ?? 0;
      const skipped = data?.skipped ?? 0;
      if (created === 0 && updated === 0 && skipped > 0) {
        setImportMsg(
          `تم اعتماد حقول الملف، بس ما انضاف عائلات: تُخطّي ${skipped}. تأكد إن عمود الاسم وعمود رقم الهوية فيهم بيانات.`
        );
      } else {
        setImportMsg(
          `تم اعتماد حقول الملف ثم الاستيراد: أُنشئ ${created}، حُدِّث ${updated}، تُخطّي ${skipped}.`
        );
      }
      fetchFamilies();
    } catch (err) {
      const timedOut = err?.code === 'ECONNABORTED' || /timeout/i.test(String(err?.message || ''));
      setImportMsg(
        getApiErrorMessage(
          err,
          timedOut
            ? 'الاستيراد أخذ وقت أطول من المتوقع. خلّي الصفحة مفتوحة وجرب ترفع الملف مرة ثانية.'
            : 'تعذر استيراد الملف. تحقق من الصيغة وحاول مرة أخرى.'
        )
      );
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
      showNotice(getApiErrorMessage(err, 'تعذر حذف العائلة.'));
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: 'head_name',
      label: (
        <span>
          رب الأسرة
          <span className="mt-0.5 block text-[11px] font-normal text-primary">اضغط لفتح الملف</span>
        </span>
      ),
      render: (row) => (
        <FamilyProfileLink href={`/${campSlug}/admin/families/${row.id}`} name={row.head_name} />
      ),
    },
    { key: 'national_id', label: 'رقم الهوية' },
    {
      key: 'login_serial',
      label: 'رقم الدخول',
      render: (row) => <span className="font-mono">{formatLoginSerial(row)}</span>,
    },
    {
      key: 'members_count',
      label: 'الأفراد',
      render: (row) => (
        <span className="tabular-nums">{row.total_members ?? row.members?.length ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${campSlug}/admin/families/${row.id}`}>
            <Button size="sm" variant="outline">
              ملف العائلة
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => setSelectedFamilyId(row.id)}>
            تعديل
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  const resultHint = loading ? 'جاري البحث…' : debouncedSearch ? `${total} نتيجة` : `${total} عائلة`;
  const importOk = importMsg.startsWith('تم');
  const noFamiliesYet = !loading && !debouncedSearch && total === 0;

  return (
    <AdminShell
      title="سجل العائلات"
      subtitle={camp?.name}
      extras={
        <>
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
            confirmLabel="حذف العائلة"
            cancelLabel="إلغاء"
            danger
            loading={deleting}
            onConfirm={confirmDelete}
            onClose={() => !deleting && setDeleteTarget(null)}
          />
        </>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleExcel}
      />

      <PageGuidePanel
        sections={adminGuideSections(campSlug ? `/${campSlug}` : '')}
        sectionId="families"
        guideHref={adminGuideHref(campSlug ? `/${campSlug}` : '')}
      />

      {importMsg ? (
        <Alert variant={importOk ? 'success' : 'error'} className="mb-4">
          {importMsg}
        </Alert>
      ) : null}

      <Table
        columns={columns}
        rows={families}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        toolbar={
          <div className="flex flex-col gap-3">
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm leading-relaxed text-foreground">
              لفتح بيانات الأسرة كاملة (الأفراد، رقم الدخول، الطرود): اضغطوا على{' '}
              <span className="font-semibold text-primary underline decoration-primary/50 underline-offset-4">
                اسم رب الأسرة
              </span>{' '}
              أو زر <span className="font-semibold">ملف العائلة</span>. زر تعديل لتغيير البيانات، وحذف لإزالة الأسرة.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1" role="search">
                <label htmlFor="family-search" className="sr-only">
                  بحث عن عائلة
                </label>
                <Input
                  id="family-search"
                  placeholder="مثال: أحمد محمد أو 401234567"
                  type="search"
                  autoComplete="off"
                  icon={IconSearch}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                <p className="text-sm tabular-nums text-muted-foreground">{resultHint}</p>
                {search ? (
                  <Button type="button" size="sm" variant="ghost" onClick={clearSearch}>
                    <IconClose className="h-4 w-4" /> مسح البحث
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={downloadingTemplate || importing}
                  loading={downloadingTemplate}
                  onClick={downloadTemplate}
                >
                  <IconDownload className="h-4 w-4" /> تنزيل النموذج
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={importing}
                  loading={importing}
                  onClick={() => fileRef.current?.click()}
                >
                  استيراد Excel
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <IconPlus className="h-4 w-4" /> إضافة عائلة
                </Button>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              نزّلوا النموذج: فيه كل معايير الفلترة (الحالة الاجتماعية، عدد الأفراد، الجنس، تاريخ الميلاد، وصلة القرابة
              لأفراد إضافيين من فرد 1 إلى فرد 6). عبّوه ثم ارفعوه من استيراد Excel. تقدروا كمان ترفعوا ملفكم الجاهز.
              عدّلوا الحقول بعد الاستيراد من{' '}
              <Link href={`/${campSlug}/admin/family-fields`} className="font-semibold text-primary hover:underline">
                حقول العائلات
              </Link>
              . رقم الهوية واسم رب الأسرة مطلوبان.
            </p>
          </div>
        }
        empty={
          noFamiliesYet ? (
            <div className="mx-auto max-w-sm">
              <p className="text-[length:var(--text-h3)] font-semibold text-foreground">لا عائلات في السجل بعد</p>
              <p className="mt-2 text-sm text-muted-foreground">
                أضف عائلة واحدة للبدء، أو نزّل النموذج الفاضي وعبّيه، أو ارفع ملف Excel جاهز.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <IconPlus className="h-4 w-4" /> إضافة عائلة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={downloadingTemplate || importing}
                  loading={downloadingTemplate}
                  onClick={downloadTemplate}
                >
                  تنزيل النموذج
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={importing}
                  loading={importing}
                  onClick={() => fileRef.current?.click()}
                >
                  استيراد Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-sm">
              <p className="text-[length:var(--text-h3)] font-semibold text-foreground">
                لا نتائج لـ «{debouncedSearch}»
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                جرّب اسماً أو رقم هوية آخر، أو امسح البحث لعرض السجل كاملاً.
              </p>
              <Button type="button" variant="outline" className="mt-4" onClick={clearSearch}>
                مسح البحث
              </Button>
            </div>
          )
        }
      />
    </AdminShell>
  );
}
