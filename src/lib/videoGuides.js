/**
 * فيديوهات توضيحية لأهم سيناريوهات المنصة.
 * الافتراضي: ملفات داخل /videos
 * إذا رُفعت إلى درايف: ضع الرابط في المتغيّر المقابل بـ .env
 */
const DRIVE = {
  notifications: process.env.NEXT_PUBLIC_VIDEO_NOTIFICATIONS || '',
  'excel-import': process.env.NEXT_PUBLIC_VIDEO_EXCEL_IMPORT || '',
  'filter-distribute': process.env.NEXT_PUBLIC_VIDEO_FILTER_DISTRIBUTE || '',
  'change-requests': process.env.NEXT_PUBLIC_VIDEO_CHANGE_REQUESTS || '',
  'family-account': process.env.NEXT_PUBLIC_VIDEO_FAMILY_ACCOUNT || '',
  'camp-register': process.env.NEXT_PUBLIC_VIDEO_CAMP_REGISTER || '',
};

export const VIDEO_GUIDES = {
  notifications: {
    id: 'notifications',
    topic: 'تفعيل الإشعارات',
    buttonLabel: 'فيديو',
    file: 'notifications.mp4',
  },
  'excel-import': {
    id: 'excel-import',
    topic: 'استيراد العائلات من إكسل',
    buttonLabel: 'فيديو',
    file: 'excel-import.mp4',
  },
  'filter-distribute': {
    id: 'filter-distribute',
    topic: 'فلترة التوزيع وتسجيل الطرود',
    buttonLabel: 'فيديو',
    file: 'filter-distribute.mp4',
  },
  'change-requests': {
    id: 'change-requests',
    topic: 'طلب تعديل البيانات',
    buttonLabel: 'فيديو',
    file: 'change-requests.mp4',
  },
  'family-account': {
    id: 'family-account',
    topic: 'حساب العائلة',
    buttonLabel: 'فيديو',
    file: 'family-account.mp4',
  },
  'camp-register': {
    id: 'camp-register',
    topic: 'تسجيل المخيم',
    buttonLabel: 'فيديو',
    file: 'camp-register.mp4',
  },
};

export function videoGuideUrl(id) {
  const guide = VIDEO_GUIDES[id];
  if (!guide) return '';
  const drive = String(DRIVE[id] || '').trim();
  if (drive) return drive;
  return `/videos/${guide.file}`;
}

export function getVideoGuide(id) {
  const guide = VIDEO_GUIDES[id];
  if (!guide) return null;
  const url = videoGuideUrl(id);
  if (!url) return null;
  return { ...guide, url, external: /^https?:\/\//i.test(url) };
}
