'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useCamp } from '@/context/CampContext';

function normalizeAnnouncement(row) {
  return row.data ?? row;
}

export default function FeaturedNewsSection() {
  const { camp } = useCamp() || {};
  const newsBase = camp?.slug ? `/${camp.slug}/news` : '/news';
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get('/announcements')
      .then((res) => {
        const list = res.data?.data ?? [];
        setItems(list.slice(0, 3).map(normalizeAnnouncement));
      })
      .catch(() => setItems([]));
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <section className="py-14" aria-labelledby="featured-news-heading">
      <h2
        id="featured-news-heading"
        className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 md:text-start"
      >
        أخبار مميزة
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <Link
            key={post.id}
            href={`${newsBase}#post-${post.id}`}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 transition hover:shadow-md">
              <div className="flex flex-1 flex-col p-5" dir="rtl">
                <time className="text-xs font-medium text-slate-500">
                  {formatDate(post.published_at || post.created_at)}
                </time>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {post.content}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
