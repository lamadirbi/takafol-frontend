/** شعار المنصة الافتراضي (ملف في `public/`) عندما لا يكون للمخيم شعار مرفوع */
export const DEFAULT_BRAND_LOGO = '/taibaLogo.png';

export function campLogoSrc(camp) {
  const url = String(camp?.logo_url || '').trim();
  if (url) return url;

  const path = String(camp?.logo_path || '').trim();
  if (!path) return DEFAULT_BRAND_LOGO;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/storage/${path}`;
}

export function isDefaultBrandLogo(src) {
  return !src || src === DEFAULT_BRAND_LOGO;
}
