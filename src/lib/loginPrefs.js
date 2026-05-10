const STORAGE_FAMILY = 'taiba_remember_family';
const STORAGE_ADMIN_USERNAME = 'taiba_remember_admin_username';

export function loadFamilyLogin() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_FAMILY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (j?.remember && j.national_id != null && j.serial != null) {
      return {
        nationalId: String(j.national_id),
        serial: String(j.serial),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveFamilyLogin(nationalId, serial, remember = true) {
  if (typeof window === 'undefined') return;
  if (!remember) {
    localStorage.removeItem(STORAGE_FAMILY);
    return;
  }
  localStorage.setItem(
    STORAGE_FAMILY,
    JSON.stringify({
      remember: true,
      national_id: String(nationalId ?? '').trim(),
      serial: String(serial ?? '').trim(),
    })
  );
}

export function clearFamilyLogin() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_FAMILY);
}

export function loadAdminUsername() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_ADMIN_USERNAME) || '';
  } catch {
    return '';
  }
}

export function saveAdminUsername(username) {
  if (typeof window === 'undefined') return;
  const u = String(username ?? '').trim();
  if (u) {
    localStorage.setItem(STORAGE_ADMIN_USERNAME, u);
  } else {
    localStorage.removeItem(STORAGE_ADMIN_USERNAME);
  }
}

/** @deprecated استخدم loadAdminUsername */
export function loadAdminEmail() {
  return loadAdminUsername();
}

/** @deprecated */
export function saveAdminEmail(email) {
  saveAdminUsername(email);
}
