export const REALM_FAMILY = 'family';
export const REALM_ADMIN = 'admin';

export const AUTH_CHANGE_EVENT = 'takafol-auth-change';

const KEYS = {
  [REALM_FAMILY]: {
    token: 'takafol_family_token',
    user: 'takafol_family_user',
    camp: 'takafol_family_camp',
  },
  [REALM_ADMIN]: {
    token: 'takafol_admin_token',
    user: 'takafol_admin_user',
    camp: 'takafol_admin_camp',
  },
};

const LEGACY_TOKEN = 'taiba_token';
const LEGACY_USER = 'taiba_user';

export function unwrapAuthUser(payload) {
  if (!payload) return null;
  return payload.data ?? payload.user?.data ?? payload.user ?? payload;
}

export function isAuthRealm(value) {
  return value === REALM_FAMILY || value === REALM_ADMIN;
}

/** سوبر أدمن عام للمنصة (بدون مخيم) */
export function isGlobalSuperAdmin(user) {
  return Boolean(user?.is_super && (user.camp_id == null || user.camp_id === ''));
}

/** أي بوابة تخص المسار الحالي — null للصفحات العامة */
export function realmFromPathname(pathname) {
  const p = String(pathname || '');
  if (!p) return null;
  if (p.startsWith('/super-admin')) return REALM_ADMIN;
  if (p.includes('/login/admin')) return REALM_ADMIN;
  if (/(?:^|\/)admin(?:\/|$)/.test(p)) return REALM_ADMIN;
  if (p.includes('/family')) return REALM_FAMILY;
  if (/\/login\/?$/.test(p)) return REALM_FAMILY;
  return null;
}

export function realmFromApiUrl(url) {
  const u = String(url || '').split('?')[0];
  if (!u) return null;
  if (u.includes('/admin/login')) return null;
  if (/(?:^|\/)login\/?$/.test(u)) return null;
  if (u.includes('/admin')) return REALM_ADMIN;
  if (u.includes('/family/')) return REALM_FAMILY;
  return null;
}

export function emitAuthChange(realm) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { realm } }));
}

function readJson(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAuthToken(realm) {
  if (typeof window === 'undefined' || !isAuthRealm(realm)) return null;
  try {
    return localStorage.getItem(KEYS[realm].token);
  } catch {
    return null;
  }
}

export function getAuthUser(realm) {
  if (!isAuthRealm(realm)) return null;
  const user = readJson(KEYS[realm].user);
  return user && typeof user === 'object' ? user : null;
}

export function getAuthCampSlug(realm) {
  if (typeof window === 'undefined' || !isAuthRealm(realm)) return null;
  try {
    return localStorage.getItem(KEYS[realm].camp) || null;
  } catch {
    return null;
  }
}

export function writeAuthSession(realm, { token, user, campSlug } = {}) {
  if (typeof window === 'undefined' || !isAuthRealm(realm)) return;
  const keys = KEYS[realm];
  try {
    if (token) localStorage.setItem(keys.token, token);
    else localStorage.removeItem(keys.token);

    if (user) localStorage.setItem(keys.user, JSON.stringify(user));
    else localStorage.removeItem(keys.user);

    const slug = campSlug || null;
    if (slug) localStorage.setItem(keys.camp, slug);
    else localStorage.removeItem(keys.camp);
  } catch {
    /* quota / private mode */
  }
  emitAuthChange(realm);
}

export function clearAuthSession(realm) {
  writeAuthSession(realm, { token: null, user: null, campSlug: null });
}

export function migrateLegacyAuth() {
  if (typeof window === 'undefined') return;
  try {
    const oldToken = localStorage.getItem(LEGACY_TOKEN);
    const oldUser = readJson(LEGACY_USER);
    if (oldToken && oldUser && typeof oldUser === 'object') {
      const realm = oldUser.role === 'admin' ? REALM_ADMIN : REALM_FAMILY;
      if (!getAuthToken(realm)) {
        writeAuthSession(realm, { token: oldToken, user: oldUser, campSlug: null });
      }
    }
    localStorage.removeItem(LEGACY_TOKEN);
    localStorage.removeItem(LEGACY_USER);
  } catch {
    /* ignore */
  }
}

/**
 * أي جلسة تُرفق مع الطلب: من الإعداد، أو مسار الـ API، أو الصفحة، أو المتاح.
 */
export function resolveRequestRealm(config, pathname) {
  if (isAuthRealm(config?.authRealm)) return config.authRealm;
  const fromApi = realmFromApiUrl(config?.url);
  if (fromApi) return fromApi;
  const fromPath = realmFromPathname(pathname);
  if (fromPath) return fromPath;
  if (getAuthToken(REALM_FAMILY)) return REALM_FAMILY;
  if (getAuthToken(REALM_ADMIN)) return REALM_ADMIN;
  return null;
}
