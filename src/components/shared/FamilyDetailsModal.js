'use client';

import Modal from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function FamilyDetailsModal({ open, onClose, family }) {
  if (!family) return null;

  const distributions = Array.isArray(family.distributions) ? family.distributions : [];
  const received = distributions
    .filter((d) => (d?.status ?? '') === 'received')
    .slice()
    .sort((a, b) => {
      const da = new Date(a?.delivered_at || a?.created_at || 0).getTime();
      const db = new Date(b?.delivered_at || b?.created_at || 0).getTime();
      return db - da;
    });

  return (
    <Modal open={open} onClose={onClose} title="تفاصيل العائلة">
      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>معلومات عامة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">اسم رب العائلة</span>
              <span className="font-medium">{family.head_name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">رقم الهوية</span>
              <span className="font-mono">{family.national_id}</span>
            </div>
            {family.login_serial ? (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">رقم الدخول</span>
                <span dir="ltr" className="font-mono font-medium">
                  {family.login_serial}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>طرود تم استلامها مسبقاً</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-xs font-semibold text-slate-700">
              عدد الطرود المستلمة: {received.length}
            </p>
            {received.length ? (
              received.map((d) => {
                const when = d.delivered_at || d.created_at || null;
                const label =
                  d.package_label || d.package_type?.data?.name || d.package_type?.name || 'طرد';
                return (
                  <div
                    key={d.id ?? `${label}-${when}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{when ? formatDate(when) : ''}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">لا يوجد طرود مستلمة بعد.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفراد الأسرة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(family.members || []).map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground">
                  تاريخ الميلاد: {m.date_of_birth ?? '—'} — العمر: {m.age ?? '—'} — الجنس: {m.gender || '—'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
