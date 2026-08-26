import axios from 'axios';
import {
  REALM_FAMILY,
  clearAuthSession,
  getAuthCampSlug,
  getAuthToken,
  isAuthRealm,
  resolveRequestRealm,
} from '@/lib/authSession';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';

/** مسارات لا تُفسَّر كـ slug مخيم (جذر التطبيق) */
const RESERVED_PATH_SEGMENTS = new Set([
  'super-admin',
  '_next',
  'api',
  'favicon.ico',
]);

/**
 * يستنتج slug المخيم من مسار الواجهة: /{slug}/...
 * يعود بـ null على الصفحة الرئيسية أو المسارات المحجوزة.
 */
export function getCampSlugFromPathname(pathname) {
  if (!pathname || pathname === '/') return null;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg || RESERVED_PATH_SEGMENTS.has(seg)) return null;
  return seg;
}

function resolveCampSlugForRequest(realm) {
  if (typeof window === 'undefined') return null;
  const fromPath = getCampSlugFromPathname(window.location.pathname);
  if (fromPath) return fromPath;
  if (realm) return getAuthCampSlug(realm);

  const hostname = window.location.hostname || '';
  if (hostname.endsWith('.localhost') && hostname !== 'localhost') {
    return hostname.split('.')[0];
  }
  return null;
}

function isPublicAuthUrl(url) {
  const u = String(url || '').split('?')[0];
  return u.includes('/admin/login') || /(?:^|\/)login\/?$/.test(u);
}

function isPublicApiUrl(url) {
  const u = String(url || '').split('?')[0];
  if (isPublicAuthUrl(u)) return true;
  if (u.includes('/admin/')) return false;
  if (u.includes('/family/')) return false;
  return (
    /(?:^|\/)announcements\/?$/.test(u) ||
    /(?:^|\/)camps\/?$/.test(u) ||
    /(?:^|\/)camps\/[^/]+\/?$/.test(u) ||
    u.includes('/site-settings') ||
    u.includes('/push/public-key') ||
    u.includes('/push/instant-app') ||
    u.includes('/camp-registration-requests')
  );
}

function headerAuthorization(headers) {
  if (!headers) return '';
  if (typeof headers.get === 'function') {
    return String(headers.get('Authorization') || headers.get('authorization') || '');
  }
  return String(headers.Authorization || headers.authorization || '');
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    let realm = isAuthRealm(config.authRealm) ? config.authRealm : null;
    if (!realm && !isPublicAuthUrl(config.url) && !isPublicApiUrl(config.url)) {
      realm = resolveRequestRealm(config, pathname);
    }
    if (realm) {
      config.authRealm = realm;
      const token = getAuthToken(realm);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      else delete config.headers.Authorization;
    } else {
      delete config.headers.Authorization;
    }

    const slug = resolveCampSlugForRequest(realm);
    if (slug) {
      config.headers['X-Camp-Slug'] = slug;
    } else {
      delete config.headers['X-Camp-Slug'];
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.data?.code;
    const status = err.response?.status;
    const config = err.config || {};
    const url = config.url || '';
    const sentAuth = headerAuthorization(config.headers);

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !isPublicAuthUrl(url) &&
      sentAuth
    ) {
      const realm = config.authRealm || resolveRequestRealm(config, window.location.pathname);
      if (realm) clearAuthSession(realm);
    }

    if (status === 403 && code === 'subscription_expired' && typeof window !== 'undefined') {
      clearAuthSession(REALM_FAMILY);
      const slug =
        getCampSlugFromPathname(window.location.pathname) || getAuthCampSlug(REALM_FAMILY);
      if (slug && !window.location.pathname.includes('/login')) {
        window.location.replace(`/${slug}/login?reason=subscription`);
      }
    }
    return Promise.reject(err);
  }
);

/** @deprecated استخدم getAuthToken(realm) */
export function setAuthToken(token) {
  /* بقي للتوافق — الجلسات تُكتب عبر writeAuthSession */
  if (typeof window === 'undefined') return;
  if (!token) return;
}

/** @deprecated */
export function getAuthTokenLegacy() {
  if (typeof window === 'undefined') return null;
  return getAuthToken(resolveRequestRealm({}, window.location.pathname));
}
