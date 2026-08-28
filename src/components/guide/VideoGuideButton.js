'use client';

import { getVideoGuide } from '@/lib/videoGuides';

export default function VideoGuideButton({ videoId, className = '' }) {
  const guide = getVideoGuide(videoId);
  if (!guide) return null;

  return (
    <a
      href={guide.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 ${className}`.trim()}
    >
      {guide.buttonLabel}
    </a>
  );
}
