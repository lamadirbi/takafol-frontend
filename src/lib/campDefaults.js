/** المخيم الافتراضي لمسارات قديمة مثل /login و /admin/families */
export const DEFAULT_CAMP_SLUG =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEFAULT_CAMP_SLUG) || 'taiba';
