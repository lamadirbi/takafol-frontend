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
    <section className="py-6" aria-labelledby="featured-news-heading">
      <h2 id="featured-news-heading" className="mb-3 text-lg font-bold text-foreground">
        أخبار مميزة
      </h2>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {items.map((post, i) => (
          <Link
            key={post.id}
            href={`${newsBase}#post-${post.id}`}
            className={`block px-4 py-4 transition-colors hover:bg-[#F0F2F5] ${i > 0 ? 'border-t border-black/8' : ''}`}
          >
            <article dir="rtl">
              <time className="text-xs text-[#65676B]">
                {formatDate(post.published_at || post.created_at)}
              </time>
              <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-foreground">{post.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#65676B]">{post.content}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
