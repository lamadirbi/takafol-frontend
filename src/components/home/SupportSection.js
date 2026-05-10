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
      className="scroll-mt-28 rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm md:p-10"
      dir="rtl"
    >
      <h2 className="text-xl font-bold text-slate-900 md:text-2xl">الدعم</h2>
      {note ? (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 whitespace-pre-wrap">
          {note}
        </p>
      ) : (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          لأي استفسار عن الطرود أو الحساب، تواصل مع اللجنة عبر القنوات الرسمية للمخيم.
        </p>
      )}
      {phone ? (
        <p className="mt-3 text-base font-medium text-slate-900" dir="ltr">
          <span className="text-slate-600" dir="rtl">
            هاتف:{' '}
          </span>
          <a className="text-primary hover:underline" href={`tel:${phone.replace(/\s/g, '')}`}>
            {phone}
          </a>
        </p>
      ) : null}
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        يمكنك متابعة{' '}
        <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={newsHref}>
          صفحة الأخبار
        </Link>{' '}
        لآخر التحديثات.
      </p>
    </section>
  );
}
