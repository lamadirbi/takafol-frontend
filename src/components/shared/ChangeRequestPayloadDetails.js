'use client';

import { familyFieldDisplay } from '@/lib/memberOptions';

const FAMILY_FIELD_LABELS = {
  head_name: 'اسم رب الأسرة',
  head_gender: 'جنس رب الأسرة',
  phone: 'رقم الجوال',
  social_status: 'الحالة الاجتماعية',
  spouse_name: 'اسم الزوج/الزوجة',
  spouse_national_id: 'هوية الزوج/الزوجة',
  original_governorate: 'المحافظة الأصلية',
  original_neighborhood: 'الحي الأصلي',
  national_id: 'رقم الهوية',
  financial_status: 'الوضع المالي',
  total_members: 'عدد الأفراد',
  login_serial: 'رقم الدخول',
};

const MEMBER_FIELD_LABELS = {
  id: 'رقم الفرد',
  name: 'الاسم',
  relationship: 'صلة القرابة',
  gender: 'الجنس',
  date_of_birth: 'تاريخ الميلاد',
};

function formatValue(key, value) {
  if (value === undefined) return '—';
  if (value === null) return '— (إفراغ)';
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  const labeled = familyFieldDisplay(key, value);
  return labeled;
}

function FieldRow({ label, children, memberName }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-slate-100 py-2 last:border-0">
      <span className="min-w-32 shrink-0 text-xs font-semibold text-slate-600">{label}</span>
      <span className="text-sm text-slate-900">
        {children}
        {memberName ? (
          <span className="mr-2 text-xs text-slate-500">
            (الفرد: {memberName})
          </span>
        ) : null}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h4 className="mb-2 text-sm font-bold text-slate-800">{children}</h4>;
}

function renderFamilyBlock(family) {
  if (!family || typeof family !== 'object' || Object.keys(family).length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <SectionTitle>تعديل بيانات العائلة</SectionTitle>
      <div className="divide-y divide-slate-50">
        {Object.entries(family).map(([key, value]) => {
          if (key === 'extra_data' && value && typeof value === 'object') {
            return Object.entries(value).map(([extraKey, extraVal]) => (
              <FieldRow key={extraKey} label={FAMILY_FIELD_LABELS[extraKey] ?? extraKey}>
                {formatValue(extraKey, extraVal)}
              </FieldRow>
            ));
          }
          return (
            <FieldRow key={key} label={FAMILY_FIELD_LABELS[key] ?? key}>
              {formatValue(key, value)}
            </FieldRow>
          );
        })}
      </div>
    </div>
  );
}

function renderMemberCard(title, member, idx) {
  const entries = Object.entries(member).filter(([k]) => k !== 'id' || title.includes('تعديل'));
  const memberName = member?.name ? String(member.name) : '';
  return (
    <div
      key={member.id != null ? `m-${member.id}-${idx}` : `add-${idx}`}
      className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
    >
      <p className="mb-2 text-xs font-semibold text-primary">{title}</p>
      <div className="space-y-0">
        {entries.map(([key, value]) => (
          <FieldRow
            key={key}
            label={MEMBER_FIELD_LABELS[key] ?? key}
            memberName={key === 'name' ? '' : memberName}
          >
            {formatValue(key, value)}
          </FieldRow>
        ))}
      </div>
    </div>
  );
}

/**
 * عرض حمولة طلب التعديل بشكل مقروء (بدلاً من JSON خام).
 */
export default function ChangeRequestPayloadDetails({ payload, memberNameById = {} }) {
  if (!payload || typeof payload !== 'object') {
    return <p className="text-sm text-slate-500">لا توجد تفاصيل.</p>;
  }

  const family = payload.family;
  const members = payload.members;
  const hasFamily = family && typeof family === 'object' && Object.keys(family).length > 0;

  const add = members && Array.isArray(members.add) ? members.add : [];
  const update = members && Array.isArray(members.update) ? members.update : [];
  const del = members && Array.isArray(members.delete) ? members.delete : [];

  const hasMembers = add.length > 0 || update.length > 0 || del.length > 0;
  const otherKeys = Object.keys(payload).filter((k) => k !== 'family' && k !== 'members');

  const hasOther = otherKeys.length > 0;

  if (!hasFamily && !hasMembers && !hasOther) {
    return <p className="text-sm text-slate-500">لا توجد تفاصيل قابلة للعرض.</p>;
  }

  return (
    <div className="mt-2 space-y-4 text-right" dir="rtl">
      {hasFamily ? renderFamilyBlock(family) : null}

      {add.length > 0 ? (
        <div className="space-y-2">
          <SectionTitle>إضافة أفراد ({add.length})</SectionTitle>
          <div className="space-y-2">
            {add.map((m, i) =>
              renderMemberCard(`فرد جديد ${add.length > 1 ? `#${i + 1}` : ''}`.trim() || 'فرد جديد', m, i)
            )}
          </div>
        </div>
      ) : null}

      {update.length > 0 ? (
        <div className="space-y-2">
          <SectionTitle>تعديل بيانات أفراد ({update.length})</SectionTitle>
          <div className="space-y-2">
            {update.map((m, i) => {
              const id = m?.id;
              const fallbackName = id != null ? memberNameById[String(id)] || memberNameById[id] || '' : '';
              const withName =
                !m?.name && fallbackName
                  ? { ...m, name: fallbackName }
                  : m;
              const title =
                id != null ? `تعديل الفرد رقم #${id}` : `تعديل فرد ${update.length > 1 ? `#${i + 1}` : ''}`.trim();
              return renderMemberCard(title, withName, i);
            })}
          </div>
        </div>
      ) : null}

      {del.length > 0 ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
          <SectionTitle>طلب حذف أفراد ({del.length})</SectionTitle>
          <ul className="list-inside list-disc text-sm text-slate-800">
            {del.map((id) => (
              <li key={String(id)}>الفرد رقم #{id}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasOther ? (
        <div className="rounded-xl border border-slate-100 bg-white p-3">
          <SectionTitle>بيانات إضافية</SectionTitle>
          <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
            {JSON.stringify(
              otherKeys.reduce((acc, k) => {
                acc[k] = payload[k];
                return acc;
              }, {}),
              null,
              2
            )}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
