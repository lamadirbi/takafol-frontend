'use client';

import { useRouter } from 'next/navigation';

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

/**
 * رجوع للصفحة السابقة، أو للرئيسية إن لم يكن هناك سجل.
 */
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
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition hover:bg-white/12 hover:ring-1 hover:ring-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${className}`}
      aria-label="رجوع"
      title="رجوع"
    >
      <ChevronIcon className="h-5 w-5 rtl:rotate-180" />
    </button>
  );
}
