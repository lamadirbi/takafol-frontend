export function unwrapAuthUser(payload) {
  if (!payload) return null;
  return payload.data ?? payload.user?.data ?? payload.user ?? payload;
}

const CAMPS_KEY = 'takafol_admin_camps';

export function readCachedAdminCamps() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CAMPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCachedAdminCamps(camps) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CAMPS_KEY, JSON.stringify(Array.isArray(camps) ? camps : []));
  } catch {
    /* ignore */
  }
}
