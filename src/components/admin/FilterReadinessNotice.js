'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function FilterReadinessNotice({ issues = [], families = 0 }) {
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';

  if (!issues.length) return null;

  const missingColumns = issues.filter((item) => item.kind === 'missing_column' && item.excel);
  const needsMembers = issues.some((item) => item.kind === 'missing_members');
  const emptyData = issues.some((item) => item.kind === 'empty_data');

  return (
    <aside
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold">حتى تزبط معايير الفلترة</p>
      <p className="mt-1 leading-relaxed text-amber-900/90">
        {families === 0
          ? 'ما في عائلات بالسجل بعد. ارفعوا ملف الإكسل أو أضيفوا أسرة، وبعدين ارجعوا للفلترة.'
          : 'إذا السجل المستورد ناقص، اطلبوا من العائلات تعدّل صفحتها وتبعت طلب تعديل. بعد الموافقة الفلترة بتزبط، ومن غير ما يتضطروا يعبّوا نموذج كامل.'}
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
        {emptyData || needsMembers ? (
          <p>
            قولوا للعيلة تفتح <strong className="font-semibold">ملفي</strong> ثم <strong className="font-semibold">تعديل الملف</strong>،
            وتختار الحالة الاجتماعية والجنس وصلة القرابة وتاريخ الميلاد من القائمة، وتبعت الطلب. بعد ما تقبلوا الطلب من{' '}
            <Link href={`${base}/admin/change-requests`} className="font-semibold underline underline-offset-4">
              طلبات التعديل
            </Link>
            ، ارجعوا للفلترة.
          </p>
        ) : null}
        {missingColumns.length > 0 ? (
          <p>
            إذا العمود مش موجود أصلاً في الملف، فعّلوا الحقل من{' '}
            <Link href={`${base}/admin/family-fields`} className="font-semibold underline underline-offset-4">
              حقول العائلات
            </Link>
            {' '}أو أضيفوه للإكسل من{' '}
            <Link href={`${base}/admin/families`} className="font-semibold underline underline-offset-4">
              سجل العائلات
            </Link>
            . العيلة كمان تقدر تعبّي نفس الحقل من صفحتها.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
