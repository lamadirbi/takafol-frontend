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
