'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import FamilyShell, { FamilyToolbar } from '@/components/layout/FamilyShell';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/ui/LogoutButton';
import Alert from '@/components/ui/Alert';
import { PageSpinner } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage, unwrapResource } from '@/lib/utils';
import { RELATIONSHIP_OPTIONS } from '@/lib/memberOptions';
import FamilySchemaFields from '@/components/admin/FamilySchemaFields';
import { enabledFamilyFields, formFromFamily } from '@/lib/familyFormSchema';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { familyGuideHref, familyGuideSections } from '@/components/guide/familyGuide';

const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'unknown', label: 'غير محدد' },
];

function normStr(v) {
  if (v == null) return '';
  return String(v).trim();
}

function normDob(v) {
  if (v == null || v === '') return '';
  return String(v).slice(0, 10);
}

function familyFormFromApi(f, fields = []) {
  return formFromFamily(fields, f);
}

function memberRowFromApi(m) {
  return {
    id: m.id,
    name: normStr(m.name),
    relationship: normStr(m.relationship),
    gender: normStr(m.gender) || 'unknown',
    date_of_birth: normDob(m.date_of_birth),
  };
}

function emptyNewMember() {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: '',
    relationship: 'ابن',
    gender: 'unknown',
    date_of_birth: '',
  };
}

function buildPayload(initialFamily, initialMemberRows, familyForm, memberRows, newMembers, deletedIds, schemaFields) {
  const initFam = familyFormFromApi(initialFamily, schemaFields);
  const family = {};
  const extra = {};
  for (const field of schemaFields || []) {
    if (!field.enabled || field.key === 'national_id' || field.key === 'date_of_birth') continue;
    const a = field.key === 'head_gender' ? normStr(familyForm[field.key]) || 'unknown' : normStr(familyForm[field.key]);
    const b = field.key === 'head_gender' ? normStr(initFam[field.key]) || 'unknown' : normStr(initFam[field.key]);
    if (a === b) continue;
    const out = familyForm[field.key] === '' && field.key !== 'head_gender' ? null : familyForm[field.key] || null;
    if (field.source === 'custom') extra[field.key] = out;
    else family[field.key] = out;
  }
  if (Object.keys(extra).length) family.extra_data = extra;

  const members = { add: [], update: [], delete: [] };
  const byIdInit = new Map(initialMemberRows.map((m) => [m.id, m]));

  for (const row of memberRows) {
    if (deletedIds.has(row.id)) continue;
    const ini = byIdInit.get(row.id);
    if (!ini) continue;
    const patch = { id: row.id };
    let changed = false;
    for (const field of ['name', 'relationship', 'gender', 'date_of_birth']) {
      const nv = field === 'date_of_birth' ? normDob(row[field]) : normStr(row[field]) || (field === 'gender' ? 'unknown' : '');
      const ov =
        field === 'date_of_birth' ? normDob(ini[field]) : normStr(ini[field]) || (field === 'gender' ? 'unknown' : '');
      const nvOut = field === 'date_of_birth' ? (row[field] ? normDob(row[field]) : null) : row[field];
      if (nv !== ov) {
        patch[field] = nvOut;
        changed = true;
      }
    }
    if (changed) members.update.push(patch);
  }

  for (const nm of newMembers) {
    const name = normStr(nm.name);
    if (!name) continue;
    members.add.push({
      name,
      relationship: normStr(nm.relationship) || null,
      gender: normStr(nm.gender) || 'unknown',
      date_of_birth: nm.date_of_birth ? normDob(nm.date_of_birth) : null,
    });
  }

  members.delete = [...deletedIds];

  const hasFamily = Object.keys(family).length > 0;
  const hasMembers =
    members.add.length > 0 || members.update.length > 0 || members.delete.length > 0;
  if (!hasFamily && !hasMembers) return null;

  const payload = {};
  if (hasFamily) payload.family = family;
  if (hasMembers) payload.members = members;
  return payload;
}

export default function FamilyChangeRequestPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp } = useCamp();
  const { user, logout, isFamilyHead } = useAuth();

  const [loading, setLoading] = useState(true);
  const [initialFamily, setInitialFamily] = useState(null);
  const [initialMemberRows, setInitialMemberRows] = useState([]);
  const [familyForm, setFamilyForm] = useState(() => familyFormFromApi({}));
  const [schemaFields, setSchemaFields] = useState([]);
  const [memberRows, setMemberRows] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [deletedIds, setDeletedIds] = useState(() => new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const nationalIdDisplay = initialFamily?.national_id ?? '—';

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/family/dashboard');
      const raw = unwrapResource(res.data?.family);
      if (!raw) {
        setInitialFamily(null);
        setInitialMemberRows([]);
        return;
      }
      setInitialFamily(raw);
      const fields = enabledFamilyFields({ enabled_fields: res.data?.form_schema });
      setSchemaFields(fields);
      const rows = Array.isArray(raw.members) ? raw.members.map(memberRowFromApi) : [];
      setInitialMemberRows(rows);
      setFamilyForm(familyFormFromApi(raw, fields));
      setMemberRows(rows.map((r) => ({ ...r })));
      setNewMembers([]);
      setDeletedIds(new Set());
    } catch {
      setError('تعذر تحميل بيانات الأسرة.');
      setInitialFamily(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function setFamilyField(name, value) {
    setFamilyForm((f) => ({ ...f, [name]: value }));
  }

  function updateMemberRow(id, field, value) {
    setMemberRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function requestDeleteMember(id) {
    const row = memberRows.find((r) => r.id === id);
    if (row && normStr(row.relationship) === 'رب الأسرة') return;
    setDeletedIds((prev) => new Set([...prev, id]));
  }

  function undoDeleteMember(id) {
    setDeletedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  const relationshipOptionsFor = useMemo(() => {
    const extra = new Set();
    for (const r of memberRows) {
      const v = normStr(r.relationship);
      if (v && !RELATIONSHIP_OPTIONS.some((o) => o.value === v)) extra.add(v);
    }
    const extraOpts = [...extra].map((v) => ({ value: v, label: `${v} (مسجّل)` }));
    return [...extraOpts, ...RELATIONSHIP_OPTIONS];
  }, [memberRows]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!initialFamily) {
      setError('لا تتوفر بيانات أسرة.');
      return;
    }
    const payload = buildPayload(
      initialFamily,
      initialMemberRows,
      familyForm,
      memberRows,
      newMembers,
      deletedIds,
      schemaFields
    );
    if (!payload) {
      setError('لم يتغيّر أي حقل. عدّل البيانات أو أضف أفراداً ثم أرسل الطلب.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/family/change-requests', { payload });
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إرسال الطلب.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!user || !isFamilyHead) {
    return (
      <FamilyShell title="طلب تعديل" subtitle={camp?.name} maxWidth="max-w-lg">
        <p className="text-center text-muted-foreground">يجب تسجيل الدخول كرب أسرة.</p>
        <Link href={`/${campSlug}/login`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center font-bold text-primary">
          الانتقال لتسجيل الدخول
        </Link>
      </FamilyShell>
    );
  }

  if (user?.subscription?.in_grace) {
    const amt = user?.subscription?.monthly_amount_ils ?? 50;
    return (
      <FamilyShell title="طلب تعديل" subtitle={camp?.name} maxWidth="max-w-lg">
        <p className="text-center text-foreground">
          اشتراك المخيم في فترة سماح — لا يمكن إرسال طلبات تعديل حتى يُسدَّد {amt} شيكل شهرياً وتُجدَّد الإدارة
          الاشتراك.
        </p>
        <Link
          href={`/${campSlug}/family/dashboard`}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center font-bold text-primary hover:underline"
        >
          العودة للوحة رب الأسرة
        </Link>
      </FamilyShell>
    );
  }

  return (
    <FamilyShell
      title="طلب تعديل بيانات"
      subtitle={camp?.name}
      maxWidth="max-w-3xl"
      toolbar={
        <FamilyToolbar maxWidth="max-w-3xl">
          <Link
            href={`/${campSlug}/family/dashboard`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
          >
            ← العودة للوحة رب الأسرة
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${campSlug}/family/change-requests`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
            >
              سجل الطلبات
            </Link>
            <LogoutButton label="خروج" onLogout={() => logout(`/${campSlug}/login`)} />
          </div>
        </FamilyToolbar>
      }
    >
        <PageGuidePanel
          sections={familyGuideSections(campSlug ? `/${campSlug}` : '')}
          sectionId="request"
          guideHref={familyGuideHref(campSlug ? `/${campSlug}` : '')}
        />
        <h1 className="text-2xl font-bold text-foreground">تعديل مقترح على السجل</h1>
        <p className="mt-2 text-sm text-[#65676B]">
          عدّل البيانات كما تريدها أن تصبح؛ لا يُطبَّق أي تغيير على السجل إلا بعد موافقة الإدارة.
        </p>

        {loading ? <PageSpinner /> : null}

        {!loading && !initialFamily ? (
          <p className="mt-8 text-sm text-red-700">{error || 'لم يُعثر على ملف أسرة.'}</p>
        ) : null}

        {done ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
            <p className="font-bold">تم إرسال طلبك بنجاح.</p>
            <p className="mt-2 text-sm">
              وُسِجِّل الطلب في سجل طلباتك ويمكنك متابعته حتى تُراجعه الإدارة وتقبله أو ترفضه.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${campSlug}/family/change-requests`)}
              >
                عرض سجل الطلبات
              </Button>
              <Button type="button" onClick={() => router.push(`/${campSlug}/family/dashboard`)}>
                العودة للوحة رب الأسرة
              </Button>
            </div>
          </div>
        ) : null}

        {!loading && initialFamily && !done ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8 rounded-xl bg-white p-4 shadow-sm sm:p-6">
            {error ? (
              <Alert>{error}</Alert>
            ) : null}

            <section className="rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">بيانات رب الأسرة والعائلة</h2>
              <p className="mt-1 text-xs text-slate-500">
                رقم الهوية للدخول: <span className="font-mono">{nationalIdDisplay}</span> (لا يُعدَّل من هنا)
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FamilySchemaFields
                  fields={schemaFields}
                  values={familyForm}
                  onChange={setFamilyField}
                  hideKeys={['national_id']}
                />
              </div>
            </section>

            <section className="rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">أفراد الأسرة المسجّلون</h2>
              <p className="mt-1 text-xs text-slate-500">
                طلب حذف فرد يُرسل للمراجعة؛ لا يمكن حذف سجل «رب الأسرة» من هنا.
              </p>
              <div className="mt-4 space-y-4">
                {memberRows.map((row) => {
                  const isDel = deletedIds.has(row.id);
                  const isHead = normStr(row.relationship) === 'رب الأسرة';
                  return (
                    <div
                      key={row.id}
                      className={`rounded-2xl border p-4 ${isDel ? 'border-amber-300 bg-amber-50 opacity-80' : 'border-border'}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">فرد #{row.id}</span>
                        <div className="flex gap-2">
                          {isDel ? (
                            <button
                              type="button"
                              className="text-sm font-semibold text-primary hover:underline"
                              onClick={() => undoDeleteMember(row.id)}
                            >
                              تراجع عن الحذف
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isHead}
                              title={isHead ? 'لا يمكن حذف رب الأسرة من الطلب' : ''}
                              className="text-sm font-semibold text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                              onClick={() => requestDeleteMember(row.id)}
                            >
                              طلب حذف
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className={`block text-sm ${isDel ? 'pointer-events-none' : ''}`}>
                          <span className="mb-1 block text-slate-700">الاسم</span>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updateMemberRow(row.id, 'name', e.target.value)}
                            disabled={isDel}
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          />
                        </label>
                        <label className={`block text-sm ${isDel ? 'pointer-events-none' : ''}`}>
                          <span className="mb-1 block text-slate-700">صلة القرابة</span>
                          <select
                            value={row.relationship}
                            onChange={(e) => updateMemberRow(row.id, 'relationship', e.target.value)}
                            disabled={isDel || isHead}
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          >
                            {relationshipOptionsFor.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={`block text-sm ${isDel ? 'pointer-events-none' : ''}`}>
                          <span className="mb-1 block text-slate-700">الجنس</span>
                          <select
                            value={row.gender}
                            onChange={(e) => updateMemberRow(row.id, 'gender', e.target.value)}
                            disabled={isDel}
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          >
                            {GENDER_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={`block text-sm ${isDel ? 'pointer-events-none' : ''}`}>
                          <span className="mb-1 block text-slate-700">تاريخ الميلاد</span>
                          <input
                            type="date"
                            value={row.date_of_birth}
                            onChange={(e) => updateMemberRow(row.id, 'date_of_birth', e.target.value)}
                            disabled={isDel}
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">إضافة أفراد جدد</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewMembers((list) => [...list, emptyNewMember()])}
                >
                  + فرد جديد
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {newMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    لا صفوف مضافة. اضغط «فرد جديد» لإدراج فرد يُضاف بعد موافقة الإدارة.
                  </p>
                ) : null}
                {newMembers.map((nm) => (
                  <div key={nm.key} className="rounded-2xl border border-dashed border-slate-300 p-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-slate-600 hover:text-red-700"
                        onClick={() => setNewMembers((list) => list.filter((x) => x.key !== nm.key))}
                      >
                        إزالة الصف
                      </button>
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">الاسم *</span>
                        <input
                          type="text"
                          value={nm.name}
                          onChange={(e) =>
                            setNewMembers((list) =>
                              list.map((x) => (x.key === nm.key ? { ...x, name: e.target.value } : x))
                            )
                          }
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">صلة القرابة</span>
                        <select
                          value={nm.relationship}
                          onChange={(e) =>
                            setNewMembers((list) =>
                              list.map((x) => (x.key === nm.key ? { ...x, relationship: e.target.value } : x))
                            )
                          }
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                        >
                          {RELATIONSHIP_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">الجنس</span>
                        <select
                          value={nm.gender}
                          onChange={(e) =>
                            setNewMembers((list) =>
                              list.map((x) => (x.key === nm.key ? { ...x, gender: e.target.value } : x))
                            )
                          }
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                        >
                          {GENDER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">تاريخ الميلاد</span>
                        <input
                          type="date"
                          value={nm.date_of_birth}
                          onChange={(e) =>
                            setNewMembers((list) =>
                              list.map((x) => (x.key === nm.key ? { ...x, date_of_birth: e.target.value } : x))
                            )
                          }
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الإرسال…' : 'إرسال طلب التعديل'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
            </div>
          </form>
        ) : null}
    </FamilyShell>
  );
}
