'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import CopyablePath from '@/components/ui/CopyablePath';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api';
import { readCachedAdminCamps, writeCachedAdminCamps } from '@/lib/authCache';
import { getApiErrorMessage, unwrapApiList } from '@/lib/utils';
import { useNotice } from '@/context/NoticeContext';

function Field({ label, children }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <p className="text-[length:var(--text-caption)] tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function SuperAdminCampDetailPage() {
  const { campId } = useParams();
  const router = useRouter();
  const showNotice = useNotice();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSubUntil, setEditSubUntil] = useState('');
  const [editPayWa, setEditPayWa] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [admName, setAdmName] = useState('');
  const [admUser, setAdmUser] = useState('');
  const [admPass, setAdmPass] = useState('');
  const [admSaving, setAdmSaving] = useState(false);
  const [admError, setAdmError] = useState('');
  const [adminCreatedPopup, setAdminCreatedPopup] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAdmins, setHistoryAdmins] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const fetchCamp = useCallback(async () => {
    try {
      const response = await api.get('/admin/camps');
      const list = Array.isArray(response.data) ? response.data : [];
      writeCachedAdminCamps(list);
      const found = list.find((c) => String(c.id) === String(campId));
      if (!found) {
        setCamp(null);
        setError('المخيم غير موجود.');
      } else {
        setCamp(found);
        setError('');
      }
    } catch (err) {
      setCamp((current) => {
        if (!current) {
          setError(getApiErrorMessage(err, 'تعذر تحميل المخيم.'));
        }
        return current ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useLayoutEffect(() => {
    const cached = readCachedAdminCamps().find((c) => String(c.id) === String(campId));
    if (cached) {
      setCamp(cached);
      setLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    fetchCamp();
  }, [fetchCamp]);

  const openEdit = () => {
    if (!camp) return;
    setEditName(camp.name);
    setEditSlug(camp.slug);
    setEditActive(!!camp.is_active);
    setEditSubUntil(camp.subscription_valid_until ? String(camp.subscription_valid_until).slice(0, 10) : '');
    setEditPayWa(camp.payment_notification_whatsapp ? String(camp.payment_notification_whatsapp) : '');
    setEditOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!camp) return;
    setEditSaving(true);
    try {
      await api.patch(`/admin/camps/${camp.id}`, {
        name: editName,
        slug: editSlug,
        is_active: editActive,
        subscription_valid_until: editSubUntil.trim() || null,
        payment_notification_whatsapp: editPayWa.trim() || null,
      });
      setEditOpen(false);
      fetchCamp();
    } catch (err) {
      showNotice(getApiErrorMessage(err, 'فشل الحفظ.'));
    } finally {
      setEditSaving(false);
    }
  };

  const openHistory = async () => {
    if (!camp) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryAdmins([]);
    try {
      const res = await api.get('/admin/users', { params: { camp_id: camp.id } });
      setHistoryAdmins(unwrapApiList(res));
    } catch (err) {
      setHistoryError(getApiErrorMessage(err, 'تعذر جلب قائمة المسؤولين.'));
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveAdmin = async (e) => {
    e.preventDefault();
    if (!camp) return;
    setAdmSaving(true);
    setAdmError('');
    try {
      await api.post('/admin/users', {
        name: admName,
        username: admUser,
        password: admPass,
        camp_id: camp.id,
        is_super: false,
      });
      setAdminOpen(false);
      setAdminCreatedPopup({
        campName: camp.name,
        name: admName,
        username: admUser,
        password: admPass,
      });
      setAdmName('');
      setAdmUser('');
      setAdmPass('');
    } catch (err) {
      setAdmError(getApiErrorMessage(err, 'فشل إنشاء المسؤول.'));
    } finally {
      setAdmSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!camp) return;
    setDeleteSaving(true);
    try {
      await api.delete(`/admin/camps/${camp.id}`);
      router.replace('/super-admin/camps');
    } catch (err) {
      showNotice(getApiErrorMessage(err, 'فشل الحذف.'));
      setDeleteSaving(false);
      setDeleteOpen(false);
    }
  };

  return (
    <SuperAdminShell
      title={camp?.name || 'تفاصيل المخيم'}
      description={loading ? 'جاري التحميل…' : camp ? 'بيانات المخيم والمسار' : 'غير موجود'}
      backHref="/super-admin/camps"
      actions={
        camp ? (
          <Button onClick={() => setAdminOpen(true)} className="w-full sm:w-auto">
            إضافة مسؤول
          </Button>
        ) : null
      }
      extras={
        <>
          <Modal open={editOpen} onClose={() => setEditOpen(false)} title="تعديل مخيم">
            <form onSubmit={saveEdit} className="space-y-3">
              <Input label="الاسم" id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <Input
                label="Slug"
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                required
                dir="ltr"
                inputClassName="text-left"
              />
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                مخيم مفعّل (يظهر في الصفحة الرئيسية)
              </label>
              <Input
                id="edit-sub-until"
                type="date"
                label="صلاحية اشتراك العائلات حتى"
                value={editSubUntil}
                onChange={(e) => setEditSubUntil(e.target.value)}
                dir="ltr"
                inputClassName="text-left"
              />
              <Input
                id="edit-pay-wa"
                label="واتساب إشعارات الدفع"
                value={editPayWa}
                onChange={(e) => setEditPayWa(e.target.value)}
                dir="ltr"
                placeholder="059xxxxxxxx"
                inputClassName="text-left"
              />
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={editSaving} loading={editSaving}>
                  حفظ
                </Button>
              </div>
            </form>
          </Modal>

          <Modal open={adminOpen} onClose={() => setAdminOpen(false)} title="مسؤول جديد للمخيم">
            <form onSubmit={saveAdmin} className="space-y-3">
              <p className="text-sm font-semibold text-primary">{camp?.name}</p>
              <Input label="الاسم" id="adm-name" value={admName} onChange={(e) => setAdmName(e.target.value)} required />
              <Input
                label="اسم المستخدم"
                id="adm-user"
                value={admUser}
                onChange={(e) => setAdmUser(e.target.value)}
                required
                dir="ltr"
                inputClassName="text-left"
              />
              <Input
                type="password"
                label="كلمة المرور"
                id="adm-pass"
                value={admPass}
                onChange={(e) => setAdmPass(e.target.value)}
                required
              />
              {admError ? <Alert>{admError}</Alert> : null}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAdminOpen(false)} disabled={admSaving}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={admSaving} loading={admSaving}>
                  إنشاء الحساب
                </Button>
              </div>
            </form>
          </Modal>

          <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="المسؤولون">
            {historyLoading ? <p className="text-sm text-muted-foreground">جاري التحميل…</p> : null}
            {historyError ? <Alert>{historyError}</Alert> : null}
            {!historyLoading && !historyError ? (
              historyAdmins.length ? (
                <ul className="divide-y divide-border border border-border">
                  {historyAdmins.map((adm) => (
                    <li key={adm.id} className="px-3 py-2 text-sm">
                      <p className="font-semibold">{adm.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        @{adm.username}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">لا يوجد مسؤولون مسجلون.</p>
              )
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setHistoryOpen(false)}>
                إغلاق
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setHistoryOpen(false);
                  setAdminOpen(true);
                }}
              >
                إضافة مسؤول
              </Button>
            </div>
          </Modal>

          <Modal open={Boolean(adminCreatedPopup)} onClose={() => setAdminCreatedPopup(null)} title="تم إنشاء المسؤول">
            <div className="space-y-2 border border-border bg-muted p-3 text-sm">
              <p>
                <span className="font-semibold">المخيم:</span> {adminCreatedPopup?.campName}
              </p>
              <p>
                <span className="font-semibold">الاسم:</span> {adminCreatedPopup?.name}
              </p>
              <p dir="ltr">
                <span className="font-semibold">Username:</span> {adminCreatedPopup?.username}
              </p>
              <p dir="ltr">
                <span className="font-semibold">Password:</span> {adminCreatedPopup?.password}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setAdminCreatedPopup(null)}>
                تم
              </Button>
            </div>
          </Modal>

          <ConfirmDialog
            open={deleteOpen}
            title="تأكيد حذف المخيم"
            message={
              camp ? (
                <div className="space-y-2">
                  <p>
                    هل أنت متأكد أنك تريد حذف المخيم <strong>«{camp.name}»</strong>؟
                  </p>
                  <p className="text-xs">لا يمكن التراجع بعد الحذف.</p>
                </div>
              ) : (
                ''
              )
            }
            confirmLabel="حذف نهائي"
            cancelLabel="إلغاء"
            danger
            loading={deleteSaving}
            onConfirm={handleDelete}
            onClose={() => {
              if (!deleteSaving) setDeleteOpen(false);
            }}
          />
        </>
      }
    >
      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">جاري التحميل…</p>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : camp ? (
        <div className="space-y-5">
          <div className="border border-border bg-card px-4 py-2">
            <Field label="اسم المخيم">{camp.name}</Field>
            <Field label="الحالة">{camp.is_active ? 'مفعّل' : 'موقوف'}</Field>
            <Field label="الاشتراك حتى">
              {camp.subscription_valid_until ? (
                <span dir="ltr">{String(camp.subscription_valid_until).slice(0, 10)}</span>
              ) : (
                <span className="text-muted-foreground">بدون حد</span>
              )}
            </Field>
            <Field label="واتساب الدفع">
              {camp.payment_notification_whatsapp ? (
                <span dir="ltr">{camp.payment_notification_whatsapp}</span>
              ) : (
                <span className="text-muted-foreground">غير محدد</span>
              )}
            </Field>
          </div>

          <CopyablePath slug={camp.slug} label="المسار الكامل" />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button variant="outline" className="w-full" onClick={openHistory}>
              المسؤولون
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.open(`/${camp.slug}`, '_blank', 'noopener,noreferrer')}>
              فتح الموقع
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`/${camp.slug}/login/admin`, '_blank', 'noopener,noreferrer')}
            >
              دخول الإدارة
            </Button>
            <Button variant="outline" className="w-full" onClick={openEdit}>
              تعديل
            </Button>
            <Button variant="danger" className="w-full sm:col-span-2" onClick={() => setDeleteOpen(true)}>
              حذف المخيم
            </Button>
          </div>
        </div>
      ) : null}
    </SuperAdminShell>
  );
}
