'use client';

import Link from 'next/link';
import VideoGuideButton from '@/components/guide/VideoGuideButton';

export default function PageGuidePanel({ sections, sectionId, guideHref }) {
  const section = (sections || []).find((item) => item.id === sectionId);
  if (!section) return null;

  return (
    <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm">
      <p className="text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {section.videoId ? <VideoGuideButton videoId={section.videoId} /> : null}
        <Link
          href={`${guideHref}#${section.id}`}
          className="inline-flex min-h-11 items-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf]"
        >
          الدليل
        </Link>
      </div>
    </div>
  );
}
