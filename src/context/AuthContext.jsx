'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken, setAuthToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get('/me');
      const u = data.data ?? data;
      setUser(u);
      setError(null);
      return u;
    } catch {
      setUser(null);
      setError(new Error('auth'));
      setAuthToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (nationalId, serial) => {
    setError(null);
    const national_id = String(nationalId ?? '').trim();
    const serialTrim = String(serial ?? '').trim();
    const { data } = await api.post('/login', {
      national_id,
      serial: serialTrim,
    });
    setAuthToken(data.token);
    const { data: meData } = await api.get('/me');
    const u = meData?.data ?? meData;
    setUser(u);
    return u;
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    setError(null);
    const { data } = await api.post('/admin/login', {
      username: String(email ?? '').trim(),
      password: String(password ?? ''),
    });
    setAuthToken(data.token);
    const u = data.user?.data ?? data.user;
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(
    async (redirectTo = '/login') => {
      try {
        await api.post('/logout');
      } catch {
        /* تجاهل؛ المهم مسح التوكن */
      } finally {
        setAuthToken(null);
        setUser(null);
        setLoading(false);
        if (redirectTo !== false && typeof window !== 'undefined') {
          const path = typeof redirectTo === 'string' ? redirectTo : '/login';
          router.replace(path);
          router.refresh();
        }
      }
    },
    [router]
  );

  const role = user?.role;

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      role,
      isAdmin: role === 'admin',
      isFamilyHead: role === 'family_head',
      login,
      adminLogin,
      logout,
      refresh,
    }),
    [user, loading, error, role, login, adminLogin, logout, refresh]
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
