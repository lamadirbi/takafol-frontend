'use client';

import Link from 'next/link';

export default function PageGuidePanel({ sections, sectionId, guideHref }) {
  const section = (sections || []).find((item) => item.id === sectionId);
  if (!section) return null;
  const fullHref = `${guideHref}#${section.id}`;

  return (
    <details className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground">
        <span>دليل هذه الصفحة: {section.title}</span>
        <span className="shrink-0 text-xs font-medium text-primary">عرض الخطوات</span>
      </summary>
      <div className="border-t border-black/8 px-4 py-4">
        {section.summary ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
        ) : null}
        {section.steps?.length ? (
          <ol className="mt-3 space-y-2">
            {section.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {section.tips?.length ? (
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            {section.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : null}
        <Link href={fullHref} className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">
          الدليل الكامل لكل الميزات
        </Link>
      </div>
    </details>
  );
}
