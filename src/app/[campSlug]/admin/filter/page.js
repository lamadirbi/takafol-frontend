'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import CampFilterFields from '@/components/admin/CampFilterFields';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import PageHeading from '@/components/ui/PageHeading';
import Spinner from '@/components/ui/Spinner';
import FilterReadinessNotice from '@/components/admin/FilterReadinessNotice';
import FamilyProfileLink from '@/components/admin/FamilyProfileLink';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { analyzeFilterReadiness } from '@/lib/filterReadiness';

const SOCIAL_AR = {
  married: 'متزوج',
  widowed: 'أرمل',
  separated: 'منفصل',
  divorced: 'مطلّق',
  abandoned: 'مهجور',
};

const initialFilters = {
  social_status: '',
  members_min: '',
  members_max: '',
  has_newborn: false,
  child_age_min: '',
  child_age_max: '',
  member_gender: '',
  member_is_newborn: false,
  member_relationships: [],
};

/** معايير الفلترة فقط (بدون اسم السجل) — للمعاينة والحفظ */
function buildCriteriaPayload(mode, filters) {
  const scope = mode === 'family' ? 'family' : 'members';
  const payload = { filter_scope: scope };

  if (mode === 'family') {
    if (filters.social_status) payload.social_status = filters.social_status;
    if (filters.members_min !== '' && filters.members_min != null) {
      payload.members_min = Number(filters.members_min);
    }
    if (filters.members_max !== '' && filters.members_max != null) {
      payload.members_max = Number(filters.members_max);
    }
    if (filters.has_newborn) payload.has_newborn = true;
  } else {
    if (filters.member_is_newborn) {
      payload.member_is_newborn = true;
    } else {
      if (filters.child_age_min !== '') payload.child_age_min = Number(filters.child_age_min);
      if (filters.child_age_max !== '') payload.child_age_max = Number(filters.child_age_max);
    }
    if (filters.member_gender) payload.member_gender = filters.member_gender;
    const rels = filters.member_relationships || [];
    if (rels.length === 1) payload.member_relationship = rels[0];
    else if (rels.length > 1) payload.member_relationships = rels;
  }

  return payload;
}

function buildSavePayload(recordName, mode, filters) {
  return {
    name: recordName.trim(),
    ...buildCriteriaPayload(mode, filters),
  };
}

const GENDER_AR = { male: 'ذكر', female: 'أنثى' };

export default function AdminFilterPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp } = useCamp();
  const [mode, setMode] = useState('family');
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [recordName, setRecordName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  /** معاينة مؤقتة من /preview — لا يُحفَظ في DB */
  const [preview, setPreview] = useState(null);
  const [resultSearch, setResultSearch] = useState('');
  const submittingRef = useRef(false);
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/admin/filter-readiness');
        if (!cancelled) setReadiness(data);
      } catch {
        if (!cancelled) setReadiness(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setResultSearch('');
  }, [preview?.snapshot?.generated_at]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleMemberRelationship = useCallback((value, checked) => {
    setFilters((prev) => {
      const next = new Set(prev.member_relationships || []);
      if (checked) next.add(value);
      else next.delete(value);
      return { ...prev, member_relationships: [...next] };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...initialFilters });
    setError('');
    setPreview(null);
  }, []);

  const handlePreview = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const { data: raw } = await api.post(
        '/admin/camp-filter-records/preview',
        buildCriteriaPayload(mode, filters)
      );
      const body = raw?.data ?? raw;
      setPreview({
        snapshot: body.snapshot,
        criteria: body.criteria,
      });
    } catch (err) {
      setPreview(null);
      setError(getApiErrorMessage(err, 'تعذر تنفيذ المعاينة.'));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }, [mode, filters]);

  const handleSave = useCallback(async () => {
    const name = recordName.trim();
    if (!name) {
      setError('اكتب اسماً واضحاً للسجل قبل الحفظ.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/camp-filter-records', buildSavePayload(recordName, mode, filters));
      router.push(`/${campSlug}/admin/camp-records`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ السجل.'));
    } finally {
      setSaving(false);
    }
  }, [recordName, mode, filters, router, campSlug]);

  const handleCreateAll = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSavingAll(true);
    setError('');
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const autoName =
      mode === 'family' ? `جميع عائلات المخيم — ${today}` : `جميع الأفراد — ${today}`;
    const name = recordName.trim() || autoName;
    try {
      await api.post('/admin/camp-filter-records', {
        name,
        filter_scope: mode === 'family' ? 'family' : 'members',
      });
      router.push(`/${campSlug}/admin/camp-records`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إنشاء فلترة الجميع.'));
    } finally {
      submittingRef.current = false;
      setSavingAll(false);
    }
  }, [recordName, mode, router, campSlug]);

  const snapshot = preview?.snapshot;
  const families = useMemo(() => snapshot?.families ?? [], [snapshot]);

  const allMemberRows = useMemo(() => {
    if (!families.length) return [];
    const rows = [];
    for (const fam of families) {
      const members = fam.members || [];
      for (const m of members) {
        rows.push({
          id: `${fam.id}-${m.id}`,
          family_id: fam.id,
          member_name: m.name,
          age: m.age ?? '—',
          gender: GENDER_AR[m.gender] || m.gender || '—',
          relationship: m.relationship || '—',
          head_name: fam.head_name,
          national_id: fam.national_id,
          phone: fam.phone || '—',
        });
      }
    }
    return rows;
  }, [families]);

  const familyCount = snapshot?.families_count ?? families.length;
  const memberCount = snapshot?.members_count ?? allMemberRows.length;

  const familyColumns = useMemo(
    () => [
      {
        key: 'head_name',
        label: (
          <span>
            رب الأسرة
            <span className="mt-0.5 block text-[11px] font-normal text-primary">اضغط لفتح الملف</span>
          </span>
        ),
        render: (row) =>
          row.id ? (
            <FamilyProfileLink href={`/${campSlug}/admin/families/${row.id}`} name={row.head_name} />
          ) : (
            row.head_name || '—'
          ),
      },
      { key: 'national_id', label: 'رقم الهوية' },
      { key: 'phone', label: 'الجوال' },
      { key: 'total_members', label: 'عدد الأفراد' },
      {
        key: 'social_status',
        label: 'الحالة الاجتماعية',
        render: (row) => SOCIAL_AR[row.social_status] ?? row.social_status ?? '—',
      },
    ],
    [campSlug]
  );

  const memberColumns = useMemo(
    () => [
      {
        key: 'member_name',
        label: 'اسم الفرد',
        render: (row) =>
          row.family_id ? (
            <FamilyProfileLink
              href={`/${campSlug}/admin/families/${row.family_id}`}
              name={row.member_name}
            />
          ) : (
            row.member_name || '—'
          ),
      },
      { key: 'age', label: 'العمر' },
      { key: 'gender', label: 'الجنس' },
      { key: 'relationship', label: 'صلة القرابة' },
      {
        key: 'head_name',
        label: (
          <span>
            رب الأسرة
            <span className="mt-0.5 block text-[11px] font-normal text-primary">اضغط لفتح الملف</span>
          </span>
        ),
        render: (row) =>
          row.family_id ? (
            <FamilyProfileLink href={`/${campSlug}/admin/families/${row.family_id}`} name={row.head_name} />
          ) : (
            row.head_name || '—'
          ),
      },
      { key: 'national_id', label: 'هوية الأسرة' },
      { key: 'phone', label: 'جوال الأسرة' },
    ],
    [campSlug]
  );

  const limitNote = snapshot?.limit_applied
    ? `يُعرض حتى ${snapshot.limit_applied} نتيجة كحد أقصى.`
    : null;

  const filteredFamilies = useMemo(() => {
    const q = resultSearch.trim().toLowerCase();
    if (!q) return families;
    return families.filter((f) => {
      const hay = [f.head_name, f.national_id, f.phone, String(f.total_members ?? '')]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [families, resultSearch]);

  const filteredMemberRows = useMemo(() => {
    const q = resultSearch.trim().toLowerCase();
    if (!q) return allMemberRows;
    return allMemberRows.filter((r) => {
      const hay = [
        r.member_name,
        r.head_name,
        r.national_id,
        r.phone,
        r.relationship,
        String(r.age ?? ''),
        r.gender,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allMemberRows, resultSearch]);

  const canSave = recordName.trim().length > 0;
  const readinessAnalysis = useMemo(
    () => analyzeFilterReadiness(mode, readiness),
    [mode, readiness]
  );

  return (
    <AdminShell title="فلترة العائلات والأفراد" subtitle={camp?.name}>
          <div className="mx-auto max-w-6xl space-y-8">
            <PageHeading
              className="mb-0"
              title="فلترة حسب العائلة أو الأفراد"
              description="«إنشاء فلترة لجميع المخيم» أو «لجميع الأفراد» يحفظ سجلاً بلا شروط. أو استخدم «تطبيق الفلترة» للمعاينة ثم احفظ باسم."
            />

            <FilterReadinessNotice issues={readinessAnalysis.issues} families={readinessAnalysis.families} />

            <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-1 shadow-sm" role="tablist" aria-label="نوع الفلترة">
              <button
                type="button"
                aria-pressed={mode === 'family'}
                onClick={() => {
                  setMode('family');
                  setError('');
                  setPreview(null);
                }}
                className={cn(
                  'min-h-11 flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-200 md:flex-none md:px-8',
                  mode === 'family'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                فلترة العائلات
              </button>
              <button
                type="button"
                aria-pressed={mode === 'members'}
                onClick={() => {
                  setMode('members');
                  setError('');
                  setPreview(null);
                }}
                className={cn(
                  'min-h-11 flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-200 md:flex-none md:px-8',
                  mode === 'members'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                فلترة الأفراد
              </button>
            </div>

            <CampFilterFields
              mode={mode}
              filters={filters}
              setFilter={setFilter}
              onApply={handlePreview}
              onReset={resetFilters}
              onCreateAll={handleCreateAll}
              createAllLabel={
                mode === 'family' ? 'إنشاء فلترة لجميع المخيم' : 'إنشاء فلترة لجميع الأفراد'
              }
              createAllLoading={savingAll}
              toggleMemberRelationship={toggleMemberRelationship}
              applyDisabled={loading || saving || savingAll}
              issues={readinessAnalysis.issues}
            />

            <p className="text-center text-sm text-slate-500 md:text-start">
              «تطبيق الفلترة» يعرض نتيجة مؤقتة. بعد المعاينة يمكنك حفظ السجل من الأسفل.
            </p>

            {error ? <Alert>{error}</Alert> : null}

            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-8 shadow-sm">
                <Spinner className="h-10 w-10 text-primary" label="جاري المعاينة" />
                <span className="text-sm font-medium text-muted-foreground">جاري المعاينة…</span>
              </div>
            ) : null}

            {preview && !loading ? (
              <div className="space-y-8">
                <Card className="overflow-hidden border-border shadow-sm">
                  <div className="border-b border-border bg-muted/60 px-5 py-4">
                    <h2 className="text-lg font-bold text-foreground">معاينة النتيجة</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      غير محفوظة في الأرشيف. اضغطوا اسم رب الأسرة لفتح ملف العائلة. بعد مراجعة الجدول اكتبوا اسماً ثم احفظوا السجل.
                    </p>
                    {limitNote ? <p className="mt-2 text-xs text-amber-700">{limitNote}</p> : null}
                    {readinessAnalysis.issues.length > 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-amber-800">
                        إذا الجدول فاضي أو ناقص، السبب غالباً إن معيار الفلترة مش موجود بملف الاستيراد أو البيانات مش
                        متعبّاة. راجعوا التنبيه أعلى الصفحة.
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/${campSlug}/admin/camp-records`}
                        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        عرض السجلات المحفوظة سابقاً ←
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 md:p-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        بحث ضمن المعاينة
                      </label>
                      <Input
                        className="rounded-xl"
                        placeholder={
                          mode === 'family'
                            ? 'اسم رب الأسرة، الهوية، الجوال…'
                            : 'اسم الفرد، رب الأسرة، الهوية، الصلة…'
                        }
                        value={resultSearch}
                        onChange={(e) => setResultSearch(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        تصفية الصفوف المعروضة فقط؛ لا يؤثر على الحفظ القادم.
                      </p>
                    </div>

                    <section>
                      <h3 className="mb-3 text-base font-bold text-foreground">
                        {mode === 'family'
                          ? `العائلات المطابقة (${filteredFamilies.length}${resultSearch.trim() ? ` من ${familyCount}` : ''})`
                          : `الأفراد المطابقون (${filteredMemberRows.length}${resultSearch.trim() ? ` من ${memberCount}` : ''})`}
                      </h3>
                      {mode === 'family' ? (
                        <Table
                          columns={familyColumns}
                          rows={filteredFamilies}
                          emptyMessage={
                            resultSearch.trim()
                              ? 'لا توجد عائلات تطابق البحث في المعاينة.'
                              : 'لا توجد عائلات تطابق هذه المعايير.'
                          }
                        />
                      ) : (
                        <Table
                          columns={memberColumns}
                          rows={filteredMemberRows}
                          emptyMessage={
                            resultSearch.trim()
                              ? 'لا يوجد أفراد يطابقون البحث في المعاينة.'
                              : 'لا يوجد أفراد يطابقون هذه المعايير.'
                          }
                        />
                      )}
                    </section>
                  </div>
                </Card>

                <div
                  className={
                    mode === 'family'
                      ? 'rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-center sm:text-right'
                      : 'rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm sm:text-right'
                  }
                >
                  {mode === 'family' ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">عدد العائلات</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{familyCount}</p>
                      <p className="mt-1 text-xs text-slate-600">معاينة مؤقتة</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">عدد الأفراد</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{memberCount}</p>
                      <p className="mt-1 text-xs text-slate-600">معاينة مؤقتة</p>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <Card className="border-slate-200/80 p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <label className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-800">اسم السجل (يُستخدم عند الحفظ فقط)</span>
                  <Input
                    className="mt-2 rounded-xl"
                    placeholder="مثال: توزيع شهر رمضان — فئة الأيتام"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    disabled={saving}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    لا يُحفَظ شيء في الأرشيف حتى تضغط «حفظ السجل» بعد كتابة الاسم.
                  </p>
                </label>
                <Button
                  type="button"
                  className="shrink-0 rounded-xl px-6 py-3 md:min-w-[200px]"
                  disabled={!canSave || saving || loading || savingAll}
                  onClick={handleSave}
                >
                  {saving ? 'جاري الحفظ…' : 'حفظ السجل والانتقال للأرشيف'}
                </Button>
              </div>
            </Card>
          </div>
    </AdminShell>
  );
}
