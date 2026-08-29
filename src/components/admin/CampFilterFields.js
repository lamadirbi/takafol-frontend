'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { RELATIONSHIP_OPTIONS } from '@/lib/memberOptions';
import { issueById } from '@/lib/filterReadiness';

function FieldHint({ issue }) {
  if (!issue) return null;
  return (
    <p className="mt-1 text-xs leading-relaxed text-amber-800">
      {issue.text}
      {issue.excel ? ` العمود في الملف: «${issue.excel}».` : ''}
    </p>
  );
}

/**
 * @param {'family' | 'members'} mode
 * @param {(value: string, checked: boolean) => void} [toggleMemberRelationship]
 */
export default function CampFilterFields({
  mode = 'family',
  filters,
  setFilter,
  onApply,
  onReset,
  onCreateAll,
  createAllLabel,
  createAllLoading = false,
  showArchiveLink = true,
  toggleMemberRelationship = () => {},
  applyDisabled = false,
  issues = [],
}) {
  const { campSlug } = useParams();
  const campBase = campSlug ? `/${campSlug}` : '';
  const isFamily = mode === 'family';
  const selectedRels = filters.member_relationships || [];
  const socialIssue = issueById(issues, 'social_status');
  const membersIssue = issueById(issues, 'total_members');
  const newbornIssue = issueById(issues, 'has_newborn');
  const ageIssue = issueById(issues, 'member_age');
  const genderIssue = issueById(issues, 'member_gender');
  const relIssue = issueById(issues, 'member_relationship');
  const listIssue = issueById(issues, 'members_list');

  return (
    <div
      id="filters"
      className="file-spine scroll-mt-28 overflow-hidden border border-border bg-card"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          {isFamily ? 'فلترة العائلات' : 'فلترة الأفراد'}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {isFamily
            ? 'معايير على مستوى الأسرة (الحالة الاجتماعية، عدد الأفراد). إذا السجل ناقص، اطلبوا من العائلات تعدّل صفحتها وتبعت طلب تعديل بدل ما يعبّوا نموذج كامل.'
            : 'العمر والجنس وصلة القرابة تُطبَّق معاً على نفس الفرد. الجنس وصلة القرابة عند العيلة قوائم جاهزة. يمكن اختيار أكثر من صلة قرابة.'}
        </p>
      </div>

      <div className="space-y-6 p-5 md:p-6" dir="rtl">
        {isFamily ? (
          <section className="border border-border p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              العائلة
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Select
                  label="الحالة الاجتماعية"
                  name="social_status"
                  value={filters.social_status}
                  onChange={(e) => setFilter('social_status', e.target.value)}
                  options={[
                    { value: '', label: 'الكل — بدون تقييد' },
                    { value: 'married', label: 'متزوج' },
                    { value: 'widowed', label: 'أرمل' },
                    { value: 'separated', label: 'منفصل' },
                    { value: 'divorced', label: 'مطلق' },
                    { value: 'abandoned', label: 'مهجور' },
                  ]}
                />
                <FieldHint issue={socialIssue} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="mb-1.5 text-sm font-medium text-muted-foreground">عدد أفراد الأسرة</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-28 flex-1">
                    <Input
                      label="من"
                      name="members_min"
                      type="number"
                      min={0}
                      value={filters.members_min}
                      onChange={(e) => setFilter('members_min', e.target.value)}
                    />
                  </div>
                  <div className="min-w-28 flex-1">
                    <Input
                      label="إلى"
                      name="members_max"
                      type="number"
                      min={0}
                      value={filters.members_max}
                      onChange={(e) => setFilter('members_max', e.target.value)}
                    />
                  </div>
                </div>
                <FieldHint issue={membersIssue} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.has_newborn)}
                    onChange={(e) => setFilter('has_newborn', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <span className="font-medium text-foreground">يوجد طفل حديث الولادة (عمر 0)</span>
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  يفلتر العائلات التي لديها «ابن/ابنة» عمره 0 ضمن أفراد الأسرة.
                </p>
                <FieldHint issue={newbornIssue} />
              </div>
            </div>
          </section>
        ) : (
          <section className="border border-border p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              أفراد يطابقون الشروط
            </h4>
            <FieldHint issue={listIssue} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.member_is_newborn)}
                    onChange={(e) => setFilter('member_is_newborn', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <span className="font-medium text-foreground">حديث الولادة فقط (عمر 0)</span>
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  عند تفعيلها سيتم تثبيت العمر على 0 (حديث الولادة) بغض النظر عن نطاق العمر.
                </p>
                <FieldHint issue={ageIssue} />
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-sm font-medium text-muted-foreground">عمر الفرد (نطاق)</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-28 flex-1">
                    <Input
                      label="من"
                      name="child_age_min"
                      type="number"
                      min={0}
                      value={filters.child_age_min}
                      onChange={(e) => setFilter('child_age_min', e.target.value)}
                      disabled={Boolean(filters.member_is_newborn)}
                    />
                  </div>
                  <div className="min-w-28 flex-1">
                    <Input
                      label="إلى"
                      name="child_age_max"
                      type="number"
                      min={0}
                      value={filters.child_age_max}
                      onChange={(e) => setFilter('child_age_max', e.target.value)}
                      disabled={Boolean(filters.member_is_newborn)}
                    />
                  </div>
                </div>
                <FieldHint issue={ageIssue} />
              </div>
              <div>
                <Select
                  label="جنس الفرد"
                  name="member_gender"
                  value={filters.member_gender}
                  onChange={(e) => setFilter('member_gender', e.target.value)}
                  options={[
                    { value: '', label: 'الكل' },
                    { value: 'male', label: 'ذكر' },
                    { value: 'female', label: 'أنثى' },
                  ]}
                />
                <FieldHint issue={genderIssue} />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  صلة القرابة (اختيار متعدد — يُطبَّق مع العمر والجنس على نفس الفرد)
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 border border-border p-3">
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRels.includes(opt.value)}
                        onChange={(e) => toggleMemberRelationship(opt.value, e.target.checked)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <FieldHint issue={relIssue} />
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            {onCreateAll ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={onCreateAll}
                disabled={applyDisabled || createAllLoading}
                loading={createAllLoading}
              >
                {createAllLabel || (isFamily ? 'إنشاء فلترة لجميع المخيم' : 'إنشاء فلترة لجميع الأفراد')}
              </Button>
            ) : null}
            <Button type="button" onClick={onApply} disabled={applyDisabled || createAllLoading} className="w-full sm:w-auto">
              تطبيق الفلترة
            </Button>
            {onReset ? (
              <Button type="button" variant="outline" onClick={onReset} disabled={applyDisabled || createAllLoading} className="w-full sm:w-auto">
                مسح المعايير
              </Button>
            ) : null}
          </div>
          {showArchiveLink ? (
            <Link
              href={`${campBase}/admin/camp-records`}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              السجلات المحفوظة السابقة ←
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
