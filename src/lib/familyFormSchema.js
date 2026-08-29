import { FAMILY_FINANCIAL_OPTIONS, SOCIAL_STATUS_OPTIONS, canonicalSocialStatus } from '@/lib/memberOptions';

export const FILTER_CRITERIA_FIELDS = [
  {
    key: 'social_status',
    label: 'الحالة الاجتماعية',
    type: 'select',
    enabled: true,
    source: 'catalog',
    options: SOCIAL_STATUS_OPTIONS.map((o) => ({ ...o })),
  },
  {
    key: 'head_gender',
    label: 'جنس رب الأسرة',
    type: 'select',
    enabled: true,
    source: 'catalog',
    options: [
      { value: 'male', label: 'ذكر' },
      { value: 'female', label: 'أنثى' },
      { value: 'unknown', label: 'غير محدد' },
    ],
  },
  {
    key: 'financial_status',
    label: 'الوضع المادي',
    type: 'select',
    enabled: true,
    source: 'catalog',
    options: FAMILY_FINANCIAL_OPTIONS.map((o) => ({ ...o })),
  },
];

export const FILTER_CRITERIA_KEYS = FILTER_CRITERIA_FIELDS.map((field) => field.key);

export function enabledFamilyFields(schema) {
  const list = schema?.enabled_fields || (schema?.fields || []).filter((f) => f.enabled);
  return Array.isArray(list) ? list : [];
}

/** حقول الفلترة تظهر دائماً في صفحة العائلة كقوائم اختيار، حتى لو السجل المستورد ناقص. */
export function withFilterCriteriaFields(fields) {
  const list = Array.isArray(fields) ? fields.map((field) => ({ ...field })) : [];
  const byKey = new Map(list.map((field) => [field.key, field]));
  for (const extra of FILTER_CRITERIA_FIELDS) {
    const existing = byKey.get(extra.key);
    if (existing) {
      existing.enabled = true;
      existing.type = 'select';
      existing.options = extra.options;
      if (!existing.label) existing.label = extra.label;
    } else {
      const next = { ...extra };
      byKey.set(extra.key, next);
      list.push(next);
    }
  }
  return list;
}

export function familyHasIncompleteFilterData(family) {
  if (!family) return false;
  if (!String(familyFieldValue(family, 'social_status') || '').trim()) return true;
  const members = Array.isArray(family.members) ? family.members : [];
  const head = members.find((member) => String(member?.relationship || '').trim() === 'رب الأسرة');
  const headGender = String(familyFieldValue(family, 'head_gender') || head?.gender || '').trim();
  if (!headGender || headGender === 'unknown') return true;
  if (members.length === 0) return true;
  return members.some((member) => {
    const rel = String(member?.relationship || '').trim();
    const gender = String(member?.gender || '').trim();
    const dob = String(member?.date_of_birth || '').trim();
    return !rel || !gender || gender === 'unknown' || !dob;
  });
}

export function familyFieldValue(family, key) {
  if (!family) return '';
  if (key === 'date_of_birth') {
    if (family.date_of_birth) return String(family.date_of_birth).slice(0, 10);
    const head = (family.members || []).find((m) => m.relationship === 'رب الأسرة');
    return head?.date_of_birth ? String(head.date_of_birth).slice(0, 10) : '';
  }
  if (family[key] != null && family[key] !== '') return family[key];
  const extra = family.extra_data && typeof family.extra_data === 'object' ? family.extra_data : {};
  if (extra[key] != null && extra[key] !== '') return extra[key];
  return '';
}

export function formFromFamily(fields, family, extras = {}) {
  const form = { ...extras };
  for (const field of fields) {
    const v = familyFieldValue(family, field.key);
    const raw = v == null ? '' : String(v);
    form[field.key] = field.key === 'social_status' ? canonicalSocialStatus(raw) || raw : raw;
  }
  return form;
}

export function buildFamilyPayload(fields, form) {
  const payload = {};
  const extra = {};
  for (const field of fields) {
    if (!field.enabled) continue;
    const raw = form[field.key];
    const value = raw === '' || raw == null ? null : raw;
    if (field.source === 'custom') {
      extra[field.key] = value;
    } else {
      payload[field.key] = value;
    }
  }
  if (Object.keys(extra).length) payload.extra_data = extra;
  return payload;
}

export function isFamilyFieldMissing(field, value) {
  if (!field?.required) return false;
  return String(value ?? '').trim() === '';
}
