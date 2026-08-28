'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import PageHeading from '@/components/ui/PageHeading';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useNotice } from '@/context/NoticeContext';
import {
  downloadBlobFromResponse,
  formatDate,
  getApiErrorMessage,
  unwrapPaginated,
  unwrapResource,
} from '@/lib/utils';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { adminGuideHref, adminGuideSections } from '@/components/guide/adminGuide';

function buildBeneficiaryRows(record) {
  const scope = record?.criteria?.filter_scope || 'family';
  const fams = record?.snapshot?.families || [];
  if (scope === 'members') {
    const rows = [];
    for (const f of fams) {
      for (const m of f.members || []) {
        rows.push({
          id: m.id,
          familyId: f.id,
          label: `${m.name} (${f.head_name})`,
        });
      }
    }
    return rows;
  }
  return fams.map((f) => ({
    id: f.id,
    familyId: f.id,
    label: f.head_name || `عائلة #${f.id}`,
  }));
}

export default function CampRecordDetailPage() {
  const { campSlug, recordId } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const { camp } = useCamp();
  const showNotice = useNotice();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packageName, setPackageName] = useState('طرد صحي');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [distributions, setDistributions] = useState([]);
  const [distLoading, setDistLoading] = useState(false);

  const [busyFamilyId, setBusyFamilyId] = useState(null);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/camp-filter-records/${recordId}`);
      const r = unwrapResource(res.data);
      setRecord(r);
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل السجل.'));
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  const loadDistributions = useCallback(async () => {
    setDistLoading(true);
    try {
      const res = await api.get('/admin/distributions', {
        params: { camp_filter_record_id: recordId, per_page: 500 },
      });
      setDistributions(unwrapPaginated(res).items);
    } catch {
      setDistributions([]);
    } finally {
      setDistLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (record?.id) loadDistributions();
  }, [record?.id, loadDistributions]);

  const rows = useMemo(() => (record ? buildBeneficiaryRows(record) : []), [record]);

  const distByFamily = useMemo(() => {
    const map = new Map();
    for (const d of distributions) {
      const fid = Number(d.family_id);
      if (!map.has(fid)) map.set(fid, []);
      map.get(fid).push(d);
    }
    return map;
  }, [distributions]);

  function familyDistSummary(familyId) {
    const list = distByFamily.get(Number(familyId)) || [];
    const pending = list.filter((d) => d.status === 'pending');
    const received = list.filter((d) => d.status === 'received');
    const hasAny = list.length > 0;
    const allReceived = hasAny && list.every((d) => d.status === 'received');
    return { list, pending, received, hasAny, allReceived };
  }

  const uniqueFamilyRows = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const row of rows) {
      const fid = Number(row.familyId);
      if (seen.has(fid)) continue;
      seen.add(fid);
      out.push(row);
    }
    return out;
  }, [rows]);

  async function toggleFamilyDelivery(familyId, currentlyAllReceived) {
    const fid = Number(familyId);
    setBusyFamilyId(fid);
    const previous = distributions;
    setDistributions((list) =>
      list.map((d) =>
        Number(d.family_id) === fid
          ? { ...d, status: currentlyAllReceived ? 'pending' : 'received' }
          : d
      )
    );
    try {
      if (currentlyAllReceived) {
        const list = distByFamily.get(fid) || [];
        const received = list.filter((d) => d.status === 'received');
        await Promise.all(
          received.map((d) => api.patch(`/admin/distributions/${d.id}`, { status: 'pending' }))
        );
      } else {
        const list = distByFamily.get(fid) || [];
        const pending = list.filter((d) => d.status === 'pending');
        const labels = [...new Set(pending.map((d) => d.package_label).filter(Boolean))];
        for (const label of labels) {
          await api.post('/admin/distributions/confirm-family', {
            camp_filter_record_id: Number(recordId),
            package_label: label,
            family_id: fid,
          });
        }
      }
      await loadDistributions();
    } catch (e) {
      setDistributions(previous);
      showNotice(getApiErrorMessage(e, 'تعذر تحديث حالة التسليم.'));
    } finally {
      setBusyFamilyId(null);
    }
  }

  async function downloadFilterExcel() {
    try {
      const res = await api.get(`/admin/camp-filter-records/${recordId}/export-excel`, {
        responseType: 'blob',
      });
      downloadBlobFromResponse(res, `filter-record-${recordId}.xlsx`);
    } catch (e) {
      showNotice(getApiErrorMessage(e, 'تعذر التنزيل.'));
    }
  }

  async function downloadMembersExcel() {
    try {
      const res = await api.get(`/admin/camp-filter-records/${recordId}/export-members-excel`, {
        responseType: 'blob',
      });
      downloadBlobFromResponse(res, `filter-members-${recordId}.xlsx`);
    } catch (e) {
      showNotice(getApiErrorMessage(e, 'تعذر التنزيل.'));
    }
  }

  async function sendBulkNotify() {
    const label = packageName.trim();
    if (!label) {
      setNotifyMsg('أدخل اسم الطرد.');
      return;
    }
    setNotifyLoading(true);
    setNotifyMsg('');
    try {
      await api.post('/admin/distributions/bulk', {
        camp_filter_record_id: Number(recordId),
        package_label: label,
      });
      const sent = record?.snapshot?.sent_package_labels || [];
      const merged = [...new Set([...sent, label])];
      await api.patch(`/admin/camp-filter-records/${recordId}`, {
        sent_package_labels: merged,
      });
      setNotifyMsg('تم إنشاء الطرود وإرسال الإشعارات للعائلات المستهدفة.');
      await loadRecord();
      await loadDistributions();
    } catch (e) {
      setNotifyMsg(getApiErrorMessage(e, 'تعذر الإرسال.'));
    } finally {
      setNotifyLoading(false);
    }
  }

  const labelsOnRecord = useMemo(() => {
    const fromSnap = record?.snapshot?.sent_package_labels || [];
    const fromDist = [...new Set(distributions.map((d) => d.package_label).filter(Boolean))];
    return [...new Set([...fromSnap, ...fromDist])];
  }, [record, distributions]);

  async function confirmAllForLabel(label) {
    try {
      await api.post('/admin/distributions/bulk-confirm-received', {
        camp_filter_record_id: Number(recordId),
        package_label: label,
      });
      loadDistributions();
      loadRecord();
    } catch (e) {
      showNotice(getApiErrorMessage(e, 'تعذر التأكيد.'));
    }
  }

  async function rollbackLabel(label) {
    try {
      await api.post('/admin/distributions/bulk-rollback-received', {
        camp_filter_record_id: Number(recordId),
        package_label: label,
      });
      loadDistributions();
      loadRecord();
    } catch (e) {
      showNotice(getApiErrorMessage(e, 'تعذر التراجع.'));
    }
  }

  const scope = record?.criteria?.filter_scope || 'family';
  const snap = record?.snapshot || {};
  const resultCount =
    scope === 'members'
      ? (snap.families || []).reduce((acc, f) => acc + (f.members || []).length, 0)
      : snap.families_count ?? (snap.families || []).length;

  if (loading && !record) {
    return (
      <AdminShell title="سجل الفلترة" subtitle={camp?.name}>
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10 text-primary" label="جاري التحميل" />
        </div>
      </AdminShell>
    );
  }

  if (error && !record) {
    return (
      <AdminShell title="سجل الفلترة" subtitle={camp?.name}>
        <Alert>{error}</Alert>
        <Link href={`${base}/admin/camp-records`} className="mt-4 inline-flex min-h-11 items-center text-primary">
          العودة للسجلات
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={record?.name || 'سجل الفلترة'} subtitle={camp?.name}>
          <PageGuidePanel
            sections={adminGuideSections(base)}
            sectionId="record-detail"
            guideHref={adminGuideHref(base)}
          />
          <PageHeading
            title={record?.name}
            description={`${record?.created_at ? formatDate(record.created_at) : ''} — ${scope === 'members' ? 'فلترة أفراد' : 'فلترة عائلات'} — عدد النتائج: ${resultCount}`}
            actions={
              <>
              <Button type="button" variant="outline" size="sm" onClick={downloadFilterExcel}>
                تنزيل ملف الفلترة Excel
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={downloadMembersExcel}>
                تنزيل ملف الأفراد Excel
              </Button>
              <Link
                href={`${base}/admin/camp-records`}
                className="inline-flex min-h-11 items-center rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#166534]"
              >
                السجلات
              </Link>
              </>
            }
          />

          <section className="file-spine mb-6 border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">إرسال إشعار بوجود طرد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              يُنشأ طرد قيد الانتظار للعائلات ضمن هذه اللقطة ويُرسل إشعار للهاتف عند التفعيل.
            </p>
            <div className="mt-4 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                id="package-name"
                label="اسم الطرد"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={notifyLoading}
                loading={notifyLoading}
                onClick={sendBulkNotify}
              >
                إرسال إشعار
              </Button>
            </div>
            {notifyMsg ? <p className="mt-3 text-sm text-muted-foreground">{notifyMsg}</p> : null}
          </section>

          <section className="file-spine mb-6 border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">الطرود والإشعارات المرسلة</h2>
            {distLoading ? (
              <p className="mt-2 text-sm text-slate-500">جاري التحميل…</p>
            ) : labelsOnRecord.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">لا يوجد إشعارات مرسلة بعد.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {labelsOnRecord.map((label) => {
                  const related = distributions.filter((d) => d.package_label === label);
                  const pending = related.filter((d) => d.status === 'pending').length;
                  const received = related.filter((d) => d.status === 'received').length;
                  return (
                    <li
                      key={label}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-600">
                          قيد الانتظار: {pending} — تم الاستلام: {received}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => confirmAllForLabel(label)}
                        >
                          تأكيد التسليم للجميع
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700"
                          onClick={() => rollbackLabel(label)}
                        >
                          تراجع / إلغاء الطرد
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="file-spine border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">المستفيدون والاستلام</h2>
            <p className="mt-2 text-sm text-slate-600">
              يُحدَّد التسليم حسب طرود هذا السجل: عند التفعيل يُسجَّل استلام الطرد (من قيد الانتظار إلى تم
              الاستلام). إن وُجد أكثر من نوع طرد للعائلة، يُؤكَّد الكل دفعة واحدة.
            </p>

            {uniqueFamilyRows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">لا مستفيدين في اللقطة.</p>
            ) : (
              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
                {uniqueFamilyRows.map((row) => {
                  const { hasAny, allReceived } = familyDistSummary(row.familyId);
                  const disabled = !hasAny || busyFamilyId === Number(row.familyId);
                  return (
                    <li
                      key={row.familyId}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={hasAny && allReceived}
                        disabled={disabled}
                        title={
                          !hasAny
                            ? 'لا يوجد طرد مُنشأ لهذه العائلة بعد — أرسل إشعار الطرد أولاً'
                            : allReceived
                              ? 'إلغاء تأشير الاستلام'
                              : 'تأكيد استلام الطرد'
                        }
                        onChange={() => toggleFamilyDelivery(row.familyId, allReceived)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="text-sm">{row.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </AdminShell>
  );
}
