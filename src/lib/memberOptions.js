/** قيم صلة القرابة المخزّنة في قاعدة البيانات (عربي موحّد) */
export const RELATIONSHIP_OPTIONS = [
  { value: 'رب الأسرة', label: 'رب الأسرة' },
  { value: 'زوجة', label: 'زوجة' },
  { value: 'زوج', label: 'زوج' },
  { value: 'ابن', label: 'ابن' },
  { value: 'ابنة', label: 'ابنة' },
  { value: 'أم', label: 'أم' },
  { value: 'أب', label: 'أب' },
  { value: 'أخ', label: 'أخ' },
  { value: 'أخت', label: 'أخت' },
  { value: 'جد', label: 'جد' },
  { value: 'جدة', label: 'جدة' },
  { value: 'أخرى', label: 'أخرى' },
];

/** وضع مادي للعائلة */
export const FAMILY_FINANCIAL_OPTIONS = [
  { value: 'low', label: 'منخفض' },
  { value: 'medium', label: 'متوسط' },
  { value: 'good', label: 'جيد' },
];

export const GENDER_LABELS = {
  male: 'ذكر',
  female: 'أنثى',
  unknown: 'غير محدد',
};

export const SOCIAL_STATUS_LABELS = {
  married: 'متزوج',
  widowed: 'أرمل',
  separated: 'منفصل',
  divorced: 'مطلّق',
  abandoned: 'مهجور',
  single: 'أعزب',
};

export const FILE_STATUS_LABELS = {
  active: 'نشط',
  pending: 'معلق',
  complete: 'مكتمل',
  incomplete: 'غير مكتمل',
};

function lookupLabel(map, value) {
  if (value == null || value === '') return '—';
  const s = String(value);
  return map[s] ?? s;
}

export function genderLabel(value) {
  return lookupLabel(GENDER_LABELS, value);
}

export function socialStatusLabel(value) {
  return lookupLabel(SOCIAL_STATUS_LABELS, value);
}

export function financialStatusLabel(value) {
  if (value == null || value === '') return '—';
  const row = FAMILY_FINANCIAL_OPTIONS.find((o) => o.value === value);
  return row ? row.label : String(value);
}

export function fileStatusLabel(value) {
  return lookupLabel(FILE_STATUS_LABELS, value);
}

/** عرض قيمة حقل عائلة للمستخدم (عربي) */
export function familyFieldDisplay(key, value) {
  if (value == null || value === '') return '—';
  if (key === 'head_gender' || key === 'gender') return genderLabel(value);
  if (key === 'social_status') return socialStatusLabel(value);
  if (key === 'financial_status') return financialStatusLabel(value);
  if (key === 'file_status') return fileStatusLabel(value);
  return String(value);
}

export function relationshipLabel(value) {
  if (value == null || value === '') return '—';
  const row = RELATIONSHIP_OPTIONS.find((o) => o.value === value);
  return row ? row.label : String(value);
}

/** عمود «اسم الوالد»: لرب الأسرة لا يُعرض؛ لبقية الأفراد يُستخدم اسم رب الأسرة كمرجع. */
export function memberFatherDisplayName(member, headName) {
  const rel = (member?.relationship ?? '').trim();
  if (rel === 'رب الأسرة') return '—';
  const h = (headName ?? '').trim();
  return h || '—';
}
