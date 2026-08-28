'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function FilterReadinessNotice({ issues = [], families = 0 }) {
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';

  if (!issues.length) return null;

  const missingColumns = issues.filter((item) => item.kind === 'missing_column' && item.excel);
  const needsMembers = issues.some((item) => item.kind === 'missing_members');

  return (
    <aside
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold">حتى تزبط معايير الفلترة</p>
      <p className="mt-1 leading-relaxed text-amber-900/90">
        {families === 0
          ? 'ما في عائلات بالسجل بعد. ارفعوا ملف الإكسل أو أضيفوا أسرة، وبعدين ارجعوا للفلترة.'
          : 'بعض المعايير تعتمد على أعمدة أو بيانات مش موجودة في ملف الاستيراد. النتيجة ممكن تطلع فاضية.'}
      </p>
      <ul className="mt-3 space-y-2">
        {issues.map((item) => (
          <li key={item.id} className="rounded-lg bg-white/70 px-3 py-2">
            <p className="font-semibold">{item.title}</p>
            <p className="mt-0.5 leading-relaxed text-amber-900/90">{item.text}</p>
            {item.excel ? (
              <p className="mt-1 text-xs text-amber-800">
                اسم العمود المطلوب في الملف: <span className="font-semibold">{item.excel}</span>
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1.5 leading-relaxed text-amber-900/90">
        {missingColumns.length > 0 ? (
          <p>
            أضيفوا العمود للملف وأعيدوا رفعه من{' '}
            <Link href={`${base}/admin/families`} className="font-semibold underline underline-offset-4">
              سجل العائلات
            </Link>
            ، أو فعّلوا الحقل من{' '}
            <Link href={`${base}/admin/family-fields`} className="font-semibold underline underline-offset-4">
              حقول العائلات
            </Link>{' '}
            وعبّوا البيانات من تعديل الأسرة.
          </p>
        ) : null}
        {issues.some((item) => item.kind === 'empty_data') ? (
          <p>إذا العمود موجود بس فاضي: صحّحوا القيم في الإكسل وأعيدوا الاستيراد، أو عبّوها يدوياً من زر تعديل في السجل.</p>
        ) : null}
        {needsMembers ? (
          <p>
            ملف الإكسل يحفظ رب الأسرة والزوج/الزوجة، وباقي الأفراد من أعمدة «فرد 1» إلى «فرد 6» في النموذج. عبّوا الاسم
            وصلة القرابة وتاريخ الميلاد، أو أضيفوهم من تعديل العائلة.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
