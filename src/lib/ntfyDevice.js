const STORAGE_KEY = 'takafol_ntfy_device_key';
const STORE_OPENED_KEY = 'takafol_ntfy_store_opened';
const PENDING_LINK_KEY = 'takafol_ntfy_pending_link';

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

export function ntfyStoreOpened() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORE_OPENED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markNtfyStoreOpened() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_OPENED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function ntfyPendingLinkKey() {
  return PENDING_LINK_KEY;
}
