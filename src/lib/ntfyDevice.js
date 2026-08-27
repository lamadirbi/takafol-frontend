const STORAGE_KEY = 'takafol_ntfy_device_key';

export function ntfyDeviceKey() {
  if (typeof window === 'undefined') return '';
  try {
    const existing = String(window.localStorage.getItem(STORAGE_KEY) || '').trim();
    if (existing.length >= 8) return existing.slice(0, 80);
    const created =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return `dev-${Date.now()}-fallback1`;
  }
}
