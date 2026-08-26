'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, getCampSlugFromPathname } from '@/lib/api';
import {
  AUTH_CHANGE_EVENT,
  REALM_ADMIN,
  REALM_FAMILY,
  clearAuthSession,
  getAuthCampSlug,
  getAuthToken,
  getAuthUser,
  isAuthRealm,
  migrateLegacyAuth,
  realmFromPathname,
  unwrapAuthUser,
  writeAuthSession,
} from '@/lib/authSession';

const AuthContext = createContext(null);

function loginRedirect(realm, campSlug) {
  if (realm === REALM_ADMIN) {
    return campSlug ? `/${campSlug}/login/admin` : '/super-admin/login';
  }
  return campSlug ? `/${campSlug}/login` : '/login';
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [familyUser, setFamilyUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [error, setError] = useState(null);

  const hydrateRealm = useCallback((realm) => {
    const user = getAuthUser(realm);
    if (realm === REALM_FAMILY) setFamilyUser(user);
    else setAdminUser(user);
    return user;
  }, []);

  const refreshRealm = useCallback(async (realm) => {
      const token = getAuthToken(realm);
      const setLoading = realm === REALM_FAMILY ? setFamilyLoading : setAdminLoading;
      if (!token) {
        if (realm === REALM_FAMILY) setFamilyUser(null);
        else setAdminUser(null);
        setLoading(false);
        return null;
      }
      try {
        const { data } = await api.get('/me', { authRealm: realm });
        const u = unwrapAuthUser(data);
        writeAuthSession(realm, {
          token,
          user: u,
          campSlug:
            getAuthCampSlug(realm) ||
            getCampSlugFromPathname(typeof window !== 'undefined' ? window.location.pathname : ''),
        });
        if (realm === REALM_FAMILY) setFamilyUser(u);
        else setAdminUser(u);
        setError(null);
        return u;
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || (status === 403 && err.response?.data?.code === 'subscription_expired')) {
          clearAuthSession(realm);
          if (realm === REALM_FAMILY) setFamilyUser(null);
          else setAdminUser(null);
          setError(new Error('auth'));
          return null;
        }
        hydrateRealm(realm);
        return getAuthUser(realm);
      } finally {
        setLoading(false);
      }
  }, [hydrateRealm]);

  useLayoutEffect(() => {
    migrateLegacyAuth();
    const cachedFamily = hydrateRealm(REALM_FAMILY);
    const cachedAdmin = hydrateRealm(REALM_ADMIN);
    if (cachedFamily || !getAuthToken(REALM_FAMILY)) setFamilyLoading(false);
    if (cachedAdmin || !getAuthToken(REALM_ADMIN)) setAdminLoading(false);
    if (getAuthToken(REALM_FAMILY)) refreshRealm(REALM_FAMILY);
    else setFamilyLoading(false);
    if (getAuthToken(REALM_ADMIN)) refreshRealm(REALM_ADMIN);
    else setAdminLoading(false);

    const syncFromStorage = (realm) => {
      if (!isAuthRealm(realm) && realm != null) return;
      if (!realm || realm === REALM_FAMILY) hydrateRealm(REALM_FAMILY);
      if (!realm || realm === REALM_ADMIN) hydrateRealm(REALM_ADMIN);
    };

    const onCustom = (e) => syncFromStorage(e.detail?.realm);
    const onStorage = (e) => {
      const key = e.key || '';
      if (key.includes('takafol_family')) syncFromStorage(REALM_FAMILY);
      else if (key.includes('takafol_admin')) syncFromStorage(REALM_ADMIN);
    };

    window.addEventListener(AUTH_CHANGE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
    // مرة عند التحميل فقط — التبويبات تُحدَّث عبر storage / AUTH_CHANGE_EVENT
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (nationalId, serial) => {
      setError(null);
      const campSlug = getCampSlugFromPathname(pathname);
      const { data } = await api.post('/login', {
        national_id: String(nationalId ?? '').trim(),
        serial: String(serial ?? '').trim(),
      });
      const fromLogin = unwrapAuthUser(data.user);
      writeAuthSession(REALM_FAMILY, {
        token: data.token,
        user: fromLogin,
        campSlug,
      });
      setFamilyUser(fromLogin);
      setFamilyLoading(false);
      return fromLogin;
    },
    [pathname]
  );

  const adminLogin = useCallback(
    async (email, password) => {
      setError(null);
      const campSlug = getCampSlugFromPathname(pathname);
      const { data } = await api.post('/admin/login', {
        username: String(email ?? '').trim(),
        password: String(password ?? ''),
      });
      const fromLogin = unwrapAuthUser(data.user);
      writeAuthSession(REALM_ADMIN, {
        token: data.token,
        user: fromLogin,
        campSlug: fromLogin?.is_super && fromLogin?.camp_id == null ? null : campSlug,
      });
      setAdminUser(fromLogin);
      setAdminLoading(false);
      return fromLogin;
    },
    [pathname]
  );

  const logoutRealm = useCallback(
    async (realm, redirectTo) => {
      try {
        await api.post('/logout', {}, { authRealm: realm });
      } catch {
        /* تجاهل؛ المهم مسح جلسة هذه البوابة فقط */
      } finally {
        clearAuthSession(realm);
        if (realm === REALM_FAMILY) {
          setFamilyUser(null);
          setFamilyLoading(false);
        } else {
          setAdminUser(null);
          setAdminLoading(false);
        }
        if (redirectTo !== false && typeof window !== 'undefined') {
          const slug = getCampSlugFromPathname(pathname) || getAuthCampSlug(realm);
          const path =
            typeof redirectTo === 'string' ? redirectTo : loginRedirect(realm, slug);
          router.replace(path);
          router.refresh();
        }
      }
    },
    [pathname, router]
  );

  const logout = useCallback(
    async (redirectTo = undefined) => {
      const realm = realmFromPathname(pathname) || REALM_FAMILY;
      await logoutRealm(realm, redirectTo);
    },
    [logoutRealm, pathname]
  );

  const refresh = useCallback(
    async (realm) => {
      const target = isAuthRealm(realm) ? realm : realmFromPathname(pathname);
      if (target) return refreshRealm(target);
      const [family, admin] = await Promise.all([
        getAuthToken(REALM_FAMILY) ? refreshRealm(REALM_FAMILY) : null,
        getAuthToken(REALM_ADMIN) ? refreshRealm(REALM_ADMIN) : null,
      ]);
      return admin || family;
    },
    [pathname, refreshRealm]
  );

  const portal = realmFromPathname(pathname);
  const user = portal === REALM_ADMIN ? adminUser : portal === REALM_FAMILY ? familyUser : null;
  const loading =
    portal === REALM_ADMIN
      ? adminLoading
      : portal === REALM_FAMILY
        ? familyLoading
        : false;

  const value = useMemo(
    () => ({
      user,
      familyUser,
      adminUser,
      loading,
      familyLoading,
      adminLoading,
      error,
      role: user?.role,
      isAdmin: adminUser?.role === 'admin',
      isFamilyHead: familyUser?.role === 'family_head',
      login,
      adminLogin,
      logout,
      logoutFamily: (to) => logoutRealm(REALM_FAMILY, to),
      logoutAdmin: (to) => logoutRealm(REALM_ADMIN, to),
      refresh,
    }),
    [
      user,
      familyUser,
      adminUser,
      loading,
      familyLoading,
      adminLoading,
      error,
      login,
      adminLogin,
      logout,
      logoutRealm,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider');
  }
  return ctx;
}
