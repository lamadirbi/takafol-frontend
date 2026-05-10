'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage, unwrapResource } from '@/lib/utils';
import { RELATIONSHIP_OPTIONS } from '@/lib/memberOptions';

const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'unknown', label: 'غير محدد' },
];

const SOCIAL_OPTIONS = [
  { value: 'married', label: 'متزوج' },
  { value: 'widowed', label: 'أرمل' },
  { value: 'separated', label: 'منفصل' },
  { value: 'abandoned', label: 'مهجور' },
];

function normStr(v) {
  if (v == null) return '';
  return String(v).trim();
}

function normDob(v) {
  if (v == null || v === '') return '';
  return String(v).slice(0, 10);
}

function familyFormFromApi(f) {
  return {
    head_name: normStr(f?.head_name),
    head_gender: normStr(f?.head_gender) || 'unknown',
    phone: normStr(f?.phone),
    social_status: normStr(f?.social_status),
    spouse_name: normStr(f?.spouse_name),
    spouse_national_id: normStr(f?.spouse_national_id),
    original_governorate: normStr(f?.original_governorate),
    original_neighborhood: normStr(f?.original_neighborhood),
  };
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

function buildPayload(initialFamily, initialMemberRows, familyForm, memberRows, newMembers, deletedIds) {
  const initFam = familyFormFromApi(initialFamily);
  const family = {};
  const famKeys = [
    'head_name',
    'head_gender',
    'phone',
    'social_status',
    'spouse_name',
    'spouse_national_id',
    'original_governorate',
    'original_neighborhood',
  ];
  for (const k of famKeys) {
    const a = k === 'head_gender' ? normStr(familyForm[k]) || 'unknown' : normStr(familyForm[k]);
    const b = k === 'head_gender' ? normStr(initFam[k]) || 'unknown' : normStr(initFam[k]);
    if (a !== b) {
      family[k] = familyForm[k] === '' && k !== 'head_gender' ? null : familyForm[k] || null;
    }
  }

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
      const rows = Array.isArray(raw.members) ? raw.members.map(memberRowFromApi) : [];
      setInitialMemberRows(rows);
      setFamilyForm(familyFormFromApi(raw));
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

  const handleLogout = async () => {
    await logout(`/${campSlug}/login`);
  };

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
      deletedIds
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
      <div className="flex min-h-dvh flex-col bg-slate-50" dir="rtl">
        <Header title="طلب تعديل" subtitle={camp?.name} />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center">
          <p className="text-slate-600">يجب تسجيل الدخول كرب أسرة.</p>
          <Link href={`/${campSlug}/login`} className="mt-4 inline-block font-bold text-primary">
            الانتقال لتسجيل الدخول
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.subscription?.in_grace) {
    const amt = user?.subscription?.monthly_amount_ils ?? 15;
    return (
      <div className="flex min-h-dvh flex-col bg-slate-50" dir="rtl">
        <Header title="طلب تعديل" subtitle={camp?.name} />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center">
          <p className="text-slate-800">
            اشتراك المخيم في فترة سماح — لا يمكن إرسال طلبات تعديل حتى يُسدَّد {amt} شيكل شهرياً وتُجدَّد الإدارة
            الاشتراك.
          </p>
          <Link
            href={`/${campSlug}/family/dashboard`}
            className="mt-6 inline-block font-bold text-primary hover:underline"
          >
            العودة للوحة رب الأسرة
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="طلب تعديل بيانات" subtitle={camp?.name} />

      <div className="border-b border-slate-200 bg-white px-4 py-3" dir="rtl">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${campSlug}/family/dashboard`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← العودة للوحة رب الأسرة
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${campSlug}/family/change-requests`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              سجل الطلبات
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              خروج
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900">تعديل مقترح على السجل</h1>
        <p className="mt-2 text-sm text-slate-600">
          عدّل البيانات كما تريدها أن تصبح؛ لا يُطبَّق أي تغيير على السجل إلا بعد موافقة الإدارة.
        </p>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : null}

        {!loading && !initialFamily ? (
          <p className="mt-8 text-sm text-red-700">{error || 'لم يُعثر على ملف أسرة.'}</p>
        ) : null}

        {done ? (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
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
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">بيانات رب الأسرة والعائلة</h2>
              <p className="mt-1 text-xs text-slate-500">
                رقم الهوية للدخول: <span className="font-mono">{nationalIdDisplay}</span> (لا يُعدَّل من هنا)
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">اسم رب الأسرة</span>
                  <input
                    type="text"
                    value={familyForm.head_name}
                    onChange={(e) => setFamilyField('head_name', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">جنس رب الأسرة</span>
                  <select
                    value={familyForm.head_gender}
                    onChange={(e) => setFamilyField('head_gender', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">جوال</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={familyForm.phone}
                    onChange={(e) => setFamilyField('phone', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="05xxxxxxxx"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">الحالة الاجتماعية</span>
                  <select
                    value={familyForm.social_status || ''}
                    onChange={(e) => setFamilyField('social_status', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="">—</option>
                    {SOCIAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium text-slate-700">اسم الزوج / الزوجة</span>
                  <input
                    type="text"
                    value={familyForm.spouse_name}
                    onChange={(e) => setFamilyField('spouse_name', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium text-slate-700">رقم هوية الزوج / الزوجة</span>
                  <input
                    type="text"
                    value={familyForm.spouse_national_id}
                    onChange={(e) => setFamilyField('spouse_national_id', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">المحافظة الأصلية</span>
                  <input
                    type="text"
                    value={familyForm.original_governorate}
                    onChange={(e) => setFamilyField('original_governorate', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">الحي الأصلي</span>
                  <input
                    type="text"
                    value={familyForm.original_neighborhood}
                    onChange={(e) => setFamilyField('original_neighborhood', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">أفراد الأسرة المسجّلون</h2>
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
                      className={`rounded-2xl border p-4 ${isDel ? 'border-amber-300 bg-amber-50 opacity-80' : 'border-slate-200'}`}
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
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className={`block text-sm ${isDel ? 'pointer-events-none' : ''}`}>
                          <span className="mb-1 block text-slate-700">صلة القرابة</span>
                          <select
                            value={row.relationship}
                            onChange={(e) => updateMemberRow(row.id, 'relationship', e.target.value)}
                            disabled={isDel || isHead}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">إضافة أفراد جدد</h2>
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
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
      </main>

      <Footer />
    </div>
  );
}
