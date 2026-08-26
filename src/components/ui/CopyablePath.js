'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { IconCheck, IconCopy } from '@/components/ui/Icons';
import { campPublicUrl } from '@/lib/publicUrl';

export default function CopyablePath({ slug, label = 'المسار الكامل' }) {
  const [origin, setOrigin] = useState(() => (typeof window !== 'undefined' ? window.location.origin : ''));
  const [copied, setCopied] = useState(false);
  const fullUrl = campPublicUrl(slug, origin);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function copy() {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      const input = document.createElement('textarea');
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div dir="rtl">
      {label ? <p className="mb-1.5 text-sm font-medium">{label}</p> : null}
      <div className="flex items-stretch gap-2">
        <p
          className="min-h-11 min-w-0 flex-1 break-all border border-border bg-muted/50 px-3 py-2.5 font-mono text-sm tabular-nums text-foreground"
          dir="ltr"
        >
          {fullUrl || '…'}
        </p>
        <Button type="button" variant="outline" onClick={copy} aria-label="نسخ المسار">
          {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
          {copied ? 'تم' : 'نسخ'}
        </Button>
      </div>
    </div>
  );
}
