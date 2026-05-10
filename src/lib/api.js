import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

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

function resolveCampSlugForRequest() {
  if (typeof window === 'undefined') return null;
  const fromPath = getCampSlugFromPathname(window.location.pathname);
  if (fromPath) return fromPath;

  const host = window.location.host;
  const parts = host.split('.');
  if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== '127' && parts[0] !== 'www') {
    return parts[0];
  }
  return null;
}

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('taiba_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const slug = resolveCampSlugForRequest();
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
    if (status === 403 && code === 'subscription_expired' && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('taiba_token');
        localStorage.removeItem('taiba_user');
      } catch {
        /* ignore */
      }
      const slug = resolveCampSlugForRequest();
      if (slug && !window.location.pathname.includes('/login')) {
        window.location.replace(`/${slug}/login?reason=subscription`);
      }
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('taiba_token', token);
  } else {
    localStorage.removeItem('taiba_token');
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('taiba_token');
}
