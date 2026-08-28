'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/PublicShell';
import Footer from '@/components/layout/Footer';
import FamilyShell from '@/components/layout/FamilyShell';
import AdminShell from '@/components/layout/AdminShell';
import BackButton from '@/components/ui/BackButton';
import NewsPost from '@/components/shared/NewsPost';
import PostAnnouncementForm from '@/components/admin/PostAnnouncementForm';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useCamp } from '@/context/CampContext';
import { unwrapApiList } from '@/lib/utils';
import { IconMegaphone } from '@/components/ui/Icons';

export default function NewsPage() {
  const { campSlug } = useParams() || {};
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { familyUser, adminUser } = useAuth();
  const { camp } = useCamp() || {};

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements', { params: { per_page: 50 } });
      setNews(unwrapApiList(response));
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, news]);

  const handleReactionUpdate = useCallback((postId, data) => {
    const next = data?.data ?? data;
    if (!next) return;
    setNews((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...next } : p))
    );
  }, []);

  const handlePostUpdated = useCallback((updated) => {
    if (!updated?.id) {
      fetchNews();
      return;
    }
    setNews((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  }, [fetchNews]);

  const canPost = Boolean(adminUser && (adminUser.role === 'admin' || adminUser.is_super === true));
  const interactUser = familyUser || adminUser;

  function canManagePost(item) {
    if (!adminUser) return false;
    if (adminUser.is_super || adminUser.is_primary_camp_admin) return true;
    return Number(item?.admin_user?.id) === Number(adminUser.id);
  }

  const feed = (
    <>
      {canPost ? (
        <div className="mb-4">
          <PostAnnouncementForm onPosted={fetchNews} />
        </div>
      ) : familyUser ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {String(familyUser.name || 'أ').trim().slice(0, 1)}
          </span>
          <div className="min-h-10 flex-1 rounded-full bg-[#F0F2F5] px-4 py-2.5 text-sm text-[#65676B]">
            أخبار {camp?.name || 'المخيم'} تظهر هنا
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-3">
          {news.map((item) => (
            <NewsPost
              key={item.id}
              post={item}
              user={interactUser}
              isAdmin={canPost}
              canManagePost={canManagePost(item)}
              onReactionUpdate={handleReactionUpdate}
              onUpdated={handlePostUpdated}
              onDeleted={(id) => setNews((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-center shadow-sm">
          <IconMegaphone className="mb-4 h-12 w-12 text-primary" />
          <h3 className="text-xl font-bold text-foreground">لا توجد أخبار حالياً</h3>
          <p className="mt-2 text-[#65676B]">سيتم نشر الإعلانات والتنبيهات هنا فور صدورها.</p>
        </div>
      )}
    </>
  );

  if (canPost) {
    const adminHome = campSlug ? `/${campSlug}/admin/dashboard` : '/';
    return (
      <AdminShell title="الأخبار" subtitle={camp?.name}>
        <div className="mx-auto w-full max-w-[680px]">
          <div className="mb-4 flex items-center gap-3">
            <BackButton fallbackHref={adminHome} className="rounded-full border-0 bg-[#E4E6EB]" />
            <h1 className="text-xl font-bold text-foreground">نشر خبر</h1>
          </div>
          {feed}
        </div>
      </AdminShell>
    );
  }

  if (familyUser) {
    return (
      <FamilyShell title="الأخبار" subtitle={camp?.name} maxWidth="max-w-[680px]">
        {feed}
      </FamilyShell>
    );
  }

  return (
    <Header>
      <main className="mx-auto w-full max-w-[680px] flex-1 px-3 py-6 md:px-4 md:py-8" dir="rtl">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">آخر الأخبار والتنبيهات</h1>
        </div>
        {feed}
      </main>
      <Footer />
    </Header>
  );
}
