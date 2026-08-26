'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';

export default function SupportSection() {
  const { camp } = useCamp() || {};
  const newsHref = camp?.slug ? `/${camp.slug}/news` : '/news';
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    api
      .get('/site-settings')
      .then((res) => {
        const d = res.data ?? {};
        if (d.support_note) setNote(d.support_note);
        if (d.support_phone) setPhone(d.support_phone);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="support"
      className="file-spine scroll-mt-28 border border-border bg-card px-5 py-6"
      dir="rtl"
    >
      <h2 className="text-[length:var(--text-h3)] font-semibold tracking-tight">الدعم</h2>
      {note ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {note}
        </p>
      ) : (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          لأي استفسار عن الطرود أو الحساب، تواصل مع اللجنة عبر القنوات الرسمية للمخيم.
        </p>
      )}
      {phone ? (
        <p className="mt-3 text-sm font-medium text-foreground" dir="ltr">
          <span className="text-muted-foreground" dir="rtl">
            هاتف:{' '}
          </span>
          <a className="text-primary underline-offset-4 hover:underline" href={`tel:${phone.replace(/\s/g, '')}`}>
            {phone}
          </a>
        </p>
      ) : null}
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        يمكنك متابعة{' '}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href={newsHref}>
          صفحة الأخبار
        </Link>{' '}
        لآخر التحديثات.
      </p>
    </section>
  );
}
