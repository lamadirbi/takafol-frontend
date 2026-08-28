'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FamilyProfileLink({ href, name, className }) {
  const label = name || '—';
  if (!href) return label;

  return (
    <Link
      href={href}
      title="افتح ملف العائلة بكل بياناتها"
      aria-label={`افتح ملف عائلة ${label}`}
      className={cn(
        'font-semibold text-primary underline decoration-primary/60 underline-offset-4 hover:decoration-primary',
        className
      )}
    >
      {label}
    </Link>
  );
}
