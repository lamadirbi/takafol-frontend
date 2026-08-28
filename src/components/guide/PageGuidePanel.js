'use client';

import Link from 'next/link';

export default function PageGuidePanel({ sections, sectionId, guideHref }) {
  const section = (sections || []).find((item) => item.id === sectionId);
  if (!section) return null;

  return (
    <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm">
      <p className="text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
      <Link
        href={`${guideHref}#${section.id}`}
        className="mt-1 inline-flex min-h-9 items-center text-sm font-semibold text-primary hover:underline"
      >
        الدليل
      </Link>
    </div>
  );
}
