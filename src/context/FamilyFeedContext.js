'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useCamp } from '@/context/CampContext';
import { unwrapApiList, unwrapResource, unwrapResourceArray } from '@/lib/utils';
import { REALM_FAMILY, getAuthToken } from '@/lib/authSession';

const FamilyFeedContext = createContext(null);

function seenKey(userId, campSlug) {
  return `takafol_notif_seen_${campSlug || 'camp'}_${userId || 'u'}`;
}

function readSeen(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeSeen(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function buildItems({ distributions, announcements, campSlug }) {
  const base = campSlug ? `/${campSlug}` : '';
  const items = [];

  for (const d of distributions || []) {
    const name = d.package_type?.name || d.package_label || 'طرد مساعدات';
    const when = d.updated_at || d.delivered_at || d.created_at;
    if (d.status === 'pending') {
      items.push({
        id: `pkg-pending-${d.id}`,
        kind: 'package',
        title: 'طرد بانتظارك',
        body: `لديك «${name}» بانتظار الاستلام من لجنة المخيم.`,
        href: `${base}/family/notifications`,
        created_at: when,
      });
    } else if (d.status === 'received') {
      items.push({
        id: `pkg-received-${d.id}`,
        kind: 'package_received',
        title: 'تم تسليم طرد',
        body: `تم تسليم «${name}».`,
        href: `${base}/family/notifications`,
        created_at: when,
      });
    }
  }

  for (const a of announcements || []) {
    items.push({
      id: `news-${a.id}`,
      kind: 'news',
      title: a.title || 'خبر جديد',
      body: String(a.content || '').slice(0, 120),
      href: `${base}/news#post-${a.id}`,
      created_at: a.published_at || a.created_at,
    });
  }

  items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return items;
}

export function FamilyFeedProvider({ children }) {
  const { familyUser, familyLoading } = useAuth();
  const { camp } = useCamp() || {};
  const campSlug = camp?.slug;
  const [distributions, setDistributions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(() => new Set());

  const storageKey = seenKey(familyUser?.id, campSlug);

  useEffect(() => {
    if (!familyUser) {
      setSeen(new Set());
      return;
    }
    setSeen(readSeen(storageKey));
  }, [familyUser, storageKey]);

  const refresh = useCallback(async () => {
    if (familyLoading) {
      setLoading(true);
      return;
    }
    if (!familyUser || !getAuthToken(REALM_FAMILY)) {
      setDistributions([]);
      setAnnouncements([]);
      setFamily(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [dashRes, newsRes] = await Promise.all([
        api.get('/family/dashboard', { authRealm: REALM_FAMILY }),
        api.get('/announcements', { params: { per_page: 12 } }).catch(() => ({ data: {} })),
      ]);
      const d = dashRes.data;
      setFamily(unwrapResource(d.family));
      setDistributions(unwrapResourceArray(d.current_distributions));
      setAnnouncements(unwrapApiList(newsRes));
    } catch {
      setFamily(null);
      setDistributions([]);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [familyUser, familyLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = useMemo(
    () => buildItems({ distributions, announcements, campSlug }),
    [distributions, announcements, campSlug]
  );

  const unreadCount = useMemo(
    () => items.filter((n) => !seen.has(String(n.id))).length,
    [items, seen]
  );

  const markAllRead = useCallback(() => {
    const next = new Set(items.map((n) => String(n.id)));
    setSeen(next);
    writeSeen(storageKey, next);
  }, [items, storageKey]);

  const value = useMemo(
    () => ({
      family,
      distributions,
      announcements,
      items,
      unreadCount,
      loading,
      refresh,
      markAllRead,
      isRead: (id) => seen.has(String(id)),
    }),
    [family, distributions, announcements, items, unreadCount, loading, refresh, markAllRead, seen]
  );

  return <FamilyFeedContext.Provider value={value}>{children}</FamilyFeedContext.Provider>;
}

export function useFamilyFeed() {
  const ctx = useContext(FamilyFeedContext);
  if (!ctx) {
    return {
      family: null,
      distributions: [],
      announcements: [],
      items: [],
      unreadCount: 0,
      loading: false,
      refresh: async () => {},
      markAllRead: () => {},
      isRead: () => true,
    };
  }
  return ctx;
}
