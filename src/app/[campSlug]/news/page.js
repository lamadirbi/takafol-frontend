'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsPost from '@/components/shared/NewsPost';
import PostAnnouncementForm from '@/components/admin/PostAnnouncementForm';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { unwrapApiList } from '@/lib/utils';

export default function NewsPage() {
  const { campSlug } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { camp } = useCamp();
  const { user, isAdmin } = useAuth();

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

  const handleReactionUpdate = useCallback((postId, data) => {
    const next = data?.data ?? data;
    if (!next) return;
    setNews((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...next } : p))
    );
  }, []);

  const canPost = Boolean(user && (isAdmin || user?.is_super === true));

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="أخبار المخيم" subtitle={camp?.name} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12" dir="rtl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">آخر الأخبار والتنبيهات</h1>
          <Link
            href={campSlug ? `/${campSlug}` : '/'}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← الرئيسية
          </Link>
        </div>

        {canPost ? (
          <div className="mb-10">
            <PostAnnouncementForm onPosted={fetchNews} />
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-8">
            {news.map((item) => (
              <NewsPost
                key={item.id}
                post={item}
                user={user}
                isAdmin={canPost}
                onReactionUpdate={handleReactionUpdate}
                onDeleted={(id) => setNews((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="mb-4 text-5xl">📢</div>
            <h3 className="text-xl font-bold text-slate-900">لا توجد أخبار حالياً</h3>
            <p className="mt-2 text-slate-500">سيتم نشر الإعلانات والتنبيهات هنا فور صدورها.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
