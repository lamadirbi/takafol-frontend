/** تسميات عربية لقيم الحالة القادمة من الـ API */

export const DISTRIBUTION_STATUS_AR = {
  pending: 'قيد الانتظار',
  received: 'تم الاستلام',
  not_eligible: 'غير مؤهل',
};

export function distributionStatusAr(status) {
  if (status == null || status === '') return '—';
  return DISTRIBUTION_STATUS_AR[status] ?? String(status);
}

const GENDER_AR = {
  male: 'ذكر',
  female: 'أنثى',
  unknown: 'غير محدد',
};

export function genderAr(gender) {
  if (gender == null || gender === '') return '—';
  return GENDER_AR[gender] ?? String(gender);
}

const SOCIAL_AR = {
  married: 'متزوج',
  widowed: 'أرمل',
  divorced: 'مطلق',
  separated: 'مطلق',
  abandoned: 'مهجور',
  /** قيمة قديمة في السجلات — تُعرض كمطلق */
  single: 'مطلق',
};

const FINANCIAL_AR = {
  low: 'منخفض',
  medium: 'متوسط',
  good: 'جيد',
};

export function socialStatusAr(value) {
  if (value == null || value === '') return '—';
  return SOCIAL_AR[value] ?? String(value);
}

export function financialStatusAr(value) {
  if (value == null || value === '') return '—';
  return FINANCIAL_AR[value] ?? String(value);
}
