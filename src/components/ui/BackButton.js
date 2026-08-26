'use client';

import { useRouter } from 'next/navigation';

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

export default function BackButton({ className = '', fallbackHref = '/' }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border text-foreground transition-[background-color,border-color] duration-(--duration-ui) ease-(--ease-out) hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      aria-label="رجوع"
      title="رجوع"
    >
      <ChevronIcon className="h-5 w-5 rtl:rotate-180" />
    </button>
  );
}
