'use client';

import { useEffect } from 'react';
import Link from 'next/link';

function Steps({ steps }) {
  if (!steps?.length) return null;
  return (
    <ol className="mt-3 space-y-2">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function UserGuide({ kicker, title, intro, sections }) {
  useEffect(() => {
    const id = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    if (!id) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <header className="rounded-xl bg-white p-5 shadow-sm md:p-6">
        {kicker ? <p className="text-xs font-semibold text-primary">{kicker}</p> : null}
        <h1 className="mt-1 text-[length:var(--text-h2)] font-semibold tracking-tight">{title}</h1>
        {intro ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p> : null}
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="أقسام الدليل">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full bg-[#E4E6EB] px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-[#d8dadf]"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 rounded-xl bg-white p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[length:var(--text-h3)] font-semibold tracking-tight">{section.title}</h2>
              {section.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
              ) : null}
            </div>
            {section.pageHref ? (
              <Link
                href={section.pageHref}
                className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:brightness-[0.96]"
              >
                فتح الصفحة
              </Link>
            ) : null}
          </div>
          <Steps steps={section.steps} />
          {section.tips?.length ? (
            <div className="mt-4 rounded-xl bg-[#F0F2F5] px-4 py-3">
              <p className="text-xs font-semibold text-foreground">ملاحظات</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {section.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
