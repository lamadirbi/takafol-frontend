'use client';

import React, { useEffect, useState, useCallback } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { api, setAuthToken } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BackButton from '@/components/ui/BackButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { formatDate, getApiErrorMessage, unwrapApiList, unwrapPaginated } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqPage, setReqPage] = useState(1);
  const [reqTotal, setReqTotal] = useState(0);
  const [renewals, setRenewals] = useState([]);
  const [renewalLoading, setRenewalLoading] = useState(true);
  const [renewalPage, setRenewalPage] = useState(1);
  const [renewalTotal, setRenewalTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampSlug, setNewCampSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [editCamp, setEditCamp] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSubUntil, setEditSubUntil] = useState('');
  const [editPayWa, setEditPayWa] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [newSubUntil, setNewSubUntil] = useState('');
  const [newPayWa, setNewPayWa] = useState('');

  const [adminCampId, setAdminCampId] = useState(null);
  const [adminCampName, setAdminCampName] = useState('');
  const [admName, setAdmName] = useState('');
  const [admUser, setAdmUser] = useState('');
  const [admPass, setAdmPass] = useState('');
  const [admSaving, setAdmSaving] = useState(false);
  const [admError, setAdmError] = useState('');
  const [adminCreatedPopup, setAdminCreatedPopup] = useState(null);

  const [historyCamp, setHistoryCamp] = useState(null);
  const [historyAdmins, setHistoryAdmins] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [deleteCamp, setDeleteCamp] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const router = useRouter();

  const fetchCamps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/camps');
      setCamps(response.data);
    } catch (err) {
      console.error(err);
      setCamps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const res = await api.get('/admin/camp-registration-requests', {
        params: { page: reqPage, per_page: 20 },
      });
      const { items, total } = unwrapPaginated(res);
      setRequests(items);
      setReqTotal(total);
    } catch {
      setRequests([]);
    } finally {
      setReqLoading(false);
    }
  }, [reqPage]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchRenewals = useCallback(async () => {
    setRenewalLoading(true);
    try {
      const res = await api.get('/admin/subscription-renewal-requests', {
        params: { page: renewalPage, per_page: 20 },
      });
      const { items, total } = unwrapPaginated(res);
      setRenewals(items);
      setRenewalTotal(total);
    } catch (err) {
      console.error(err);
      setRenewals([]);
      setRenewalTotal(0);
    } finally {
      setRenewalLoading(false);
    }
  }, [renewalPage]);

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/camps', {
        name: newCampName,
        slug: newCampSlug,
        is_active: true,
        ...(newSubUntil.trim()
          ? { subscription_valid_until: newSubUntil.trim() }
          : {}),
        ...(newPayWa.trim() ? { payment_notification_whatsapp: newPayWa.trim() } : {}),
      });
      setIsModalOpen(false);
      setNewCampName('');
      setNewCampSlug('');
      setNewSubUntil('');
      setNewPayWa('');
      fetchCamps();
    } catch (err) {
      setError(getApiErrorMessage(err, 'فشل إنشاء المخيم.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (campId) => {
    try {
      setDeleteSaving(true);
      await api.delete(`/admin/camps/${campId}`);
      fetchCamps();
    } catch (err) {
      alert(getApiErrorMessage(err, 'فشل الحذف.'));
    } finally {
      setDeleteSaving(false);
    }
  };

  const openEdit = (c) => {
    setEditCamp(c);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditActive(!!c.is_active);
    setEditSubUntil(c.subscription_valid_until ? String(c.subscription_valid_until).slice(0, 10) : '');
    setEditPayWa(c.payment_notification_whatsapp ? String(c.payment_notification_whatsapp) : '');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editCamp) return;
    setEditSaving(true);
    try {
      await api.patch(`/admin/camps/${editCamp.id}`, {
        name: editName,
        slug: editSlug,
        is_active: editActive,
        subscription_valid_until: editSubUntil.trim() || null,
        payment_notification_whatsapp: editPayWa.trim() || null,
      });
      setEditCamp(null);
      fetchCamps();
    } catch (err) {
      alert(getApiErrorMessage(err, 'فشل الحفظ.'));
    } finally {
      setEditSaving(false);
    }
  };

  const openAddAdmin = (camp) => {
    setAdminCampName(camp?.name || '');
    setAdminCampId(camp?.id || null);
    setAdmName('');
    setAdmUser('');
    setAdmPass('');
    setAdmError('');
  };

  const openAdminHistory = async (camp) => {
    setHistoryCamp(camp);
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryAdmins([]);
    try {
      const res = await api.get('/admin/users', { params: { camp_id: camp.id } });
      setHistoryAdmins(unwrapApiList(res));
    } catch (err) {
      setHistoryError(getApiErrorMessage(err, 'تعذر جلب قائمة المسؤولين لهذا المخيم.'));
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveAdmin = async (e) => {
    e.preventDefault();
    if (!adminCampId) return;
    setAdmSaving(true);
    setAdmError('');
    try {
      await api.post('/admin/users', {
        name: admName,
        username: admUser,
        password: admPass,
        camp_id: adminCampId,
        is_super: false,
      });
      setAdminCampId(null);
      setAdminCreatedPopup({
        campName: adminCampName,
        name: admName,
        username: admUser,
        password: admPass,
      });
    } catch (err) {
      setAdmError(getApiErrorMessage(err, 'فشل إنشاء المسؤول.'));
    } finally {
      setAdmSaving(false);
    }
  };

  const updateRequestStatus = async (row, status) => {
    try {
      await api.patch(`/admin/camp-registration-requests/${row.id}`, { status });
      fetchRequests();
    } catch (err) {
      alert(getApiErrorMessage(err, 'تعذر التحديث.'));
    }
  };

  const updateRenewalStatus = async (row, status) => {
    try {
      await api.patch(`/admin/subscription-renewal-requests/${row.id}`, { status });
      fetchRenewals();
      fetchCamps();
    } catch (err) {
      alert(getApiErrorMessage(err, 'تعذر تحديث حالة طلب التجديد.'));
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('taiba_user');
    router.replace('/');
  };

  const campColumns = [
    { key: 'name', label: 'اسم المخيم' },
    { key: 'slug', label: 'المسار (slug)', render: (r) => <span dir="ltr" className="font-mono text-sm">{r.slug}</span> },
    {
      key: 'is_active',
      label: 'الحالة',
      render: (r) => (r.is_active ? 'مفعّل' : 'موقوف'),
    },
    {
      key: 'subscription_valid_until',
      label: 'الاشتراك حتى',
      render: (r) =>
        r.subscription_valid_until ? (
          <span className="text-xs" dir="ltr">
            {String(r.subscription_valid_until).slice(0, 10)}
          </span>
        ) : (
          <span className="text-xs text-slate-400">بدون حد</span>
        ),
    },
    {
      key: 'links',
      label: 'روابط',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <a
            href={`/${row.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary underline"
          >
            الموقع
          </a>
          <span className="text-slate-300">|</span>
          <a
            href={`/${row.slug}/login/admin`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-emerald-700 underline"
          >
            دخول
          </a>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'إدارة',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" type="button" onClick={() => openEdit(row)}>
            تعديل
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => openAdminHistory(row)}>
            مسؤول
          </Button>
          <Button size="sm" type="button" className="bg-primary text-white" onClick={() => openAddAdmin(row)}>
            + مسؤول
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="border-red-200 text-red-700"
            onClick={() => setDeleteCamp(row)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  const reqColumns = [
    { key: 'applicant_name', label: 'مقدّم الطلب' },
    { key: 'camp_name', label: 'اسم المخيم' },
    { key: 'whatsapp_phone', label: 'واتساب', render: (r) => <span dir="ltr">{r.whatsapp_phone}</span> },
    {
      key: 'status',
      label: 'الحالة',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.status === 'pending' ? (
            <>
              <Button size="sm" type="button" className="bg-emerald-600 py-0.5 text-xs" onClick={() => updateRequestStatus(row, 'approved')}>
                اعتماد
              </Button>
              <Button size="sm" variant="outline" type="button" className="py-0.5 text-xs" onClick={() => updateRequestStatus(row, 'rejected')}>
                رفض
              </Button>
            </>
          ) : (
            <span className="text-xs">{row.status === 'approved' ? 'معتمد' : row.status === 'rejected' ? 'مرفوض' : row.status}</span>
          )}
        </div>
      ),
    },
  ];

  const renewalColumns = [
    {
      key: 'camp_name',
      label: 'المخيم',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.camp_name || '—'}</p>
          <p className="text-xs text-slate-500" dir="ltr">
            /{row.camp_slug || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإرسال',
      render: (row) => <span className="text-xs">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'image_url',
      label: 'الإشعار',
      render: (row) =>
        row.image_url ? (
          <a href={row.image_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline">
            عرض الصورة
          </a>
        ) : (
          <span className="text-xs text-slate-400">بدون صورة</span>
        ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.status === 'pending' ? (
            <>
              <Button size="sm" type="button" className="bg-emerald-600 py-0.5 text-xs" onClick={() => updateRenewalStatus(row, 'approved')}>
                اعتماد
              </Button>
              <Button size="sm" variant="outline" type="button" className="py-0.5 text-xs" onClick={() => updateRenewalStatus(row, 'rejected')}>
                رفض
              </Button>
            </>
          ) : (
            <span className="text-xs">
              {row.status === 'approved' ? 'معتمد' : row.status === 'rejected' ? 'مرفوض' : row.status}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <RoleGuard roles={['admin']} requireSuper={true}>
      <div className="flex min-h-dvh flex-col bg-slate-50 font-sans" dir="rtl">
        <header className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/" />
          <div>
            <h1 className="text-xl font-bold">إدارة المنصة — المخيمات</h1>
            <p className="text-sm text-slate-400">تأسيس المخيمات، المسؤولين، وطلبات التسجيل</p>
          </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            تسجيل الخروج
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">المخيمات</h2>
            <Button onClick={() => setIsModalOpen(true)} className="rounded-xl px-6">
              + مخيم جديد
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table columns={campColumns} rows={camps} loading={loading} emptyMessage="لا توجد مخيمات." />
          </div>

          <div className="mt-14 mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">طلبات تسجيل مخيمات جديدة</h2>
            <span className="text-sm text-slate-500">إجمالي: {reqTotal}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={reqColumns}
              rows={requests}
              loading={reqLoading}
              emptyMessage="لا طلبات حتى الآن."
              page={reqPage}
              pageSize={20}
              total={reqTotal}
              onPageChange={setReqPage}
            />
          </div>

          <div className="mt-14 mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">إشعارات تجديد الاشتراك من المخيمات</h2>
            <span className="text-sm text-slate-500">إجمالي: {renewalTotal}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={renewalColumns}
              rows={renewals}
              loading={renewalLoading}
              emptyMessage="لا توجد إشعارات تجديد حتى الآن."
              page={renewalPage}
              pageSize={20}
              total={renewalTotal}
              onPageChange={setRenewalPage}
            />
          </div>
        </main>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
              <h3 className="mb-4 text-xl font-bold text-slate-900">إنشاء مخيم</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">اسم المخيم</label>
                  <Input required value={newCampName} onChange={(e) => setNewCampName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Slug (إنجليزي)</label>
                  <Input
                    required
                    value={newCampSlug}
                    onChange={(e) => setNewCampSlug(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    صلاحية اشتراك العائلات حتى (اختياري)
                  </label>
                  <Input
                    type="date"
                    value={newSubUntil}
                    onChange={(e) => setNewSubUntil(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    بعد هذا التاريخ لا يدخل رب الأسرة حتى تُحدَّث من هنا. اتركه فارغاً إن لم تُفعّل الحصر بعد.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    واتساب إشعارات الدفع للمخيم (اختياري)
                  </label>
                  <Input
                    value={newPayWa}
                    onChange={(e) => setNewPayWa(e.target.value)}
                    dir="ltr"
                    placeholder="9665xxxxxxxx"
                    className="text-left"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    إنشاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editCamp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={saveEdit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
              <h3 className="mb-4 text-xl font-bold">تعديل مخيم</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">الاسم</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Slug</label>
                  <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required dir="ltr" className="text-left" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                  مخيم مفعّل (يظهر في الصفحة الرئيسية)
                </label>
                <div>
                  <label className="mb-1 block text-sm font-medium">صلاحية اشتراك العائلات حتى</label>
                  <Input
                    type="date"
                    value={editSubUntil}
                    onChange={(e) => setEditSubUntil(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    يُحدَّد شهرياً بعد استلام الدفع. إفراغ التاريخ يعطل فحص الانتهاء لهذا المخيم.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">واتساب إشعارات الدفع</label>
                  <Input
                    value={editPayWa}
                    onChange={(e) => setEditPayWa(e.target.value)}
                    dir="ltr"
                    placeholder="9665xxxxxxxx"
                    className="text-left"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditCamp(null)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={editSaving}>
                  حفظ
                </Button>
              </div>
            </form>
          </div>
        )}

        {adminCampId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={saveAdmin} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
              <h3 className="mb-2 text-xl font-bold">مسؤول جديد للمخيم</h3>
              {adminCampName ? <p className="mb-1 text-sm font-semibold text-primary">{adminCampName}</p> : null}
              <p className="mb-4 text-xs text-slate-600">أرسل لاحقاً رابط الدخول وكلمة المرور عبر واتساب.</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm">الاسم</label>
                  <Input value={admName} onChange={(e) => setAdmName(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">اسم المستخدم</label>
                  <Input value={admUser} onChange={(e) => setAdmUser(e.target.value)} required dir="ltr" className="text-left" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">كلمة المرور</label>
                  <Input type="password" value={admPass} onChange={(e) => setAdmPass(e.target.value)} required />
                </div>
              </div>
              {admError ? (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {admError}
                </p>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAdminCampId(null)} disabled={admSaving}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={admSaving}>
                  إنشاء الحساب
                </Button>
              </div>
            </form>
          </div>
        )}

        {historyCamp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
              <h3 className="text-xl font-bold text-slate-900">المسؤولون السابقون والحاليون</h3>
              <p className="mt-1 text-sm text-slate-600">
                {historyCamp.name} <span dir="ltr" className="font-mono text-xs text-slate-500">/{historyCamp.slug}</span>
              </p>
              {historyLoading ? <p className="mt-4 text-sm text-slate-500">جاري التحميل…</p> : null}
              {historyError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{historyError}</p> : null}
              {!historyLoading && !historyError ? (
                historyAdmins.length ? (
                  <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                    <ul className="divide-y divide-slate-100">
                      {historyAdmins.map((adm) => (
                        <li key={adm.id} className="px-3 py-2 text-sm">
                          <p className="font-semibold text-slate-900">{adm.name}</p>
                          <p className="text-xs text-slate-600" dir="ltr">@{adm.username}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">لا يوجد مسؤولون مسجلون لهذا المخيم.</p>
                )
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const camp = historyCamp;
                    setHistoryCamp(null);
                    openAddAdmin(camp);
                  }}
                >
                  إضافة مسؤول جديد
                </Button>
                <Button type="button" variant="outline" onClick={() => setHistoryCamp(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}

        {adminCreatedPopup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl" dir="rtl">
              <h3 className="text-xl font-bold text-emerald-700">تم إنشاء المسؤول بنجاح</h3>
              <p className="mt-2 text-sm text-slate-700">
                أرسل بيانات الدخول عبر واتساب إلى المسؤول الجديد.
              </p>
              <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p><span className="font-semibold">المخيم:</span> {adminCreatedPopup.campName || '—'}</p>
                <p><span className="font-semibold">الاسم:</span> {adminCreatedPopup.name}</p>
                <p dir="ltr"><span className="font-semibold">Username:</span> {adminCreatedPopup.username}</p>
                <p dir="ltr"><span className="font-semibold">Password:</span> {adminCreatedPopup.password}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={() => setAdminCreatedPopup(null)}>
                  تم
                </Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(deleteCamp)}
          title="تأكيد حذف المخيم"
          message={
            deleteCamp ? (
              <div className="space-y-2">
                <p>
                  هل أنت متأكد أنك تريد حذف المخيم <strong>«{deleteCamp.name}»</strong>؟
                </p>
                <p className="text-xs">
                  قد يؤثر ذلك على البيانات المرتبطة بالمخيم. لا يمكن التراجع بعد الحذف.
                </p>
              </div>
            ) : (
              ''
            )
          }
          confirmLabel="حذف نهائي"
          cancelLabel="إلغاء"
          danger={true}
          loading={deleteSaving}
          onConfirm={async () => {
            if (!deleteCamp) return;
            const id = deleteCamp.id;
            setDeleteCamp(null);
            await handleDelete(id);
          }}
          onClose={() => {
            if (!deleteSaving) setDeleteCamp(null);
          }}
        />
      </div>
    </RoleGuard>
  );
}
