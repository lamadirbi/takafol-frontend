/**
 * فيديوهات توضيحية لأهم سيناريوهات المنصة.
 * الأزرار تفتح رابطاً خارجياً حتى لا تُرفع الملفات على سيرفر الموقع.
 * يمكن استبدال الرابط من .env عند الحاجة.
 */
const HOSTED_BASE =
  'https://github.com/lamadirbi/takafol-frontend/releases/download/walkthrough-videos';

const HOSTED = {
  notifications:
    process.env.NEXT_PUBLIC_VIDEO_NOTIFICATIONS || `${HOSTED_BASE}/notifications.mp4`,
  'excel-import':
    process.env.NEXT_PUBLIC_VIDEO_EXCEL_IMPORT || `${HOSTED_BASE}/excel-import.mp4`,
  'filter-distribute':
    process.env.NEXT_PUBLIC_VIDEO_FILTER_DISTRIBUTE || `${HOSTED_BASE}/filter-distribute.mp4`,
  'change-requests':
    process.env.NEXT_PUBLIC_VIDEO_CHANGE_REQUESTS || `${HOSTED_BASE}/change-requests.mp4`,
  'family-account':
    process.env.NEXT_PUBLIC_VIDEO_FAMILY_ACCOUNT || `${HOSTED_BASE}/family-account.mp4`,
  'camp-register':
    process.env.NEXT_PUBLIC_VIDEO_CAMP_REGISTER || `${HOSTED_BASE}/camp-register.mp4`,
};

export const VIDEO_GUIDES = {
  notifications: {
    id: 'notifications',
    topic: 'تفعيل الإشعارات',
    buttonLabel: 'فيديو توضيحي لتفعيل الإشعارات',
    file: 'notifications.mp4',
  },
  'excel-import': {
    id: 'excel-import',
    topic: 'استيراد العائلات من إكسل',
    buttonLabel: 'فيديو توضيحي لاستيراد العائلات من إكسل',
    file: 'excel-import.mp4',
  },
  'filter-distribute': {
    id: 'filter-distribute',
    topic: 'فلترة التوزيع وتسجيل الطرود',
    buttonLabel: 'فيديو توضيحي لفلترة التوزيع وتسجيل الطرود',
    file: 'filter-distribute.mp4',
  },
  'change-requests': {
    id: 'change-requests',
    topic: 'طلب تعديل البيانات',
    buttonLabel: 'فيديو توضيحي لطلب تعديل البيانات',
    file: 'change-requests.mp4',
  },
  'family-account': {
    id: 'family-account',
    topic: 'حساب العائلة',
    buttonLabel: 'فيديو توضيحي لحساب العائلة',
    file: 'family-account.mp4',
  },
  'camp-register': {
    id: 'camp-register',
    topic: 'تسجيل المخيم',
    buttonLabel: 'فيديو توضيحي لتسجيل المخيم',
    file: 'camp-register.mp4',
  },
};

export function videoGuideUrl(id) {
  const guide = VIDEO_GUIDES[id];
  if (!guide) return '';
  return String(HOSTED[id] || '').trim();
}

export function getVideoGuide(id) {
  const guide = VIDEO_GUIDES[id];
  if (!guide) return null;
  const url = videoGuideUrl(id);
  if (!url) return null;
  return { ...guide, url, external: /^https?:\/\//i.test(url) };
}
