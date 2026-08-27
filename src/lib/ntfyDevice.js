const STORAGE_KEY = 'takafol_ntfy_device_key';
const STORE_OPENED_KEY = 'takafol_ntfy_store_opened';
const ASKED_OPEN_KEY = 'takafol_ntfy_asked_open';
const APP_OPENED_KEY = 'takafol_ntfy_app_opened';
const LINK_CONFIRMED_KEY = 'takafol_ntfy_link_confirmed';

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

export function ntfyAskedOpen() {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(ASKED_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markNtfyAskedOpen() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ASKED_OPEN_KEY, '1');
    window.sessionStorage.removeItem(APP_OPENED_KEY);
  } catch {
    /* ignore */
  }
}

export function ntfyAppOpened() {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(APP_OPENED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markNtfyAppOpened() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(APP_OPENED_KEY, '1');
    window.sessionStorage.removeItem(ASKED_OPEN_KEY);
  } catch {
    /* ignore */
  }
}

export function ntfyLinkConfirmed() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LINK_CONFIRMED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markNtfyLinkConfirmed() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LINK_CONFIRMED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearNtfyLinkConfirmed() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LINK_CONFIRMED_KEY);
    window.sessionStorage.removeItem(APP_OPENED_KEY);
    window.sessionStorage.removeItem(ASKED_OPEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearNtfyAppOpened() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(APP_OPENED_KEY);
    window.sessionStorage.removeItem(ASKED_OPEN_KEY);
  } catch {
    /* ignore */
  }
}
