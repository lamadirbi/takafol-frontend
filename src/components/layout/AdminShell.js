'use client';

import AdminTopbar from '@/components/layout/AdminTopbar';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';

export default function AdminShell({ title, subtitle, children, extras }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F0F2F5] md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} subtitle={subtitle} />
        <main
          className="flex-1 px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:overflow-y-auto md:px-6 md:py-6 md:pb-6"
          dir="rtl"
        >
          {children}
        </main>
        <AdminMobileNav />
      </div>
      {extras}
    </div>
  );
}
