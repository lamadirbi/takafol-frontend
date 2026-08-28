'use client';

import Badge from '@/components/ui/Badge';
import { enabledFamilyFields, familyFieldValue } from '@/lib/familyFormSchema';
import { familyFieldDisplay, genderLabel, relationshipLabel } from '@/lib/memberOptions';
import { formatDate, unwrapResourceArray } from '@/lib/utils';

function initials(name) {
  const s = String(name || '').trim();
  if (!s) return 'أ';
  return s.slice(0, 1);
}

export function formatLoginSerial(row) {
  const s = row?.login_serial ?? row?.user?.login_serial;
  if (s === undefined || s === null) return '—';
  const n = String(s).replace(/\D/g, '');
  return n.length ? n.padStart(3, '0') : String(s);
}

function formatDay(value) {
  if (value == null || value === '') return '—';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { dateStyle: 'long' }).format(date);
}

function displayField(field, family) {
  const raw = familyFieldValue(family, field.key);
  if (field.type === 'date' || field.key === 'date_of_birth') {
    return formatDay(raw);
  }
  return familyFieldDisplay(field.key, raw);
}

function isMono(key) {
  return key.includes('id') || key === 'phone' || key === 'login_serial';
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-3 border-b border-black/6 py-2.5 last:border-0 last:pb-0 first:pt-0">
      <dt className="shrink-0 text-sm text-[#65676B]">{label}</dt>
      <dd className={`text-sm font-medium ${mono ? 'font-mono tabular-nums' : 'text-end'}`}>
        {value == null || value === '' ? '—' : value}
      </dd>
    </div>
  );
}

function distLabel(st) {
  if (st === 'received') return 'تم الاستلام';
  if (st === 'pending') return 'قيد الانتظار';
  if (st === 'not_eligible') return 'غير مستحق';
  return st || '—';
}

export default function FamilyProfileView({ family, schema, actions = null }) {
  const fields = enabledFamilyFields(schema);
  const members = unwrapResourceArray(family?.members);
  const distributions = unwrapResourceArray(family?.distributions);
  const received = distributions.filter((d) => d.status === 'received');
  const pending = distributions.filter((d) => d.status === 'pending');
  const other = distributions.filter((d) => d.status !== 'received' && d.status !== 'pending');
  const extra = family?.extra_data && typeof family.extra_data === 'object' ? family.extra_data : {};
  const knownKeys = new Set(fields.map((f) => f.key));
  const extraEntries = Object.entries(extra).filter(
    ([key, value]) => !knownKeys.has(key) && value != null && String(value).trim() !== ''
  );
  const name = family?.head_name || 'عائلة';

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white shadow-sm">
        <div className="relative">
          <div className="h-28 rounded-t-xl bg-gradient-to-l from-[#1877F2] to-primary sm:h-32">
            {actions ? <div className="absolute start-3 top-3 z-10">{actions}</div> : null}
          </div>
          <div className="absolute bottom-0 start-4 translate-y-1/2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-3xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-4xl">
              {initials(name)}
            </div>
          </div>
        </div>
        <div className="px-4 pb-5 pt-14 sm:pt-16">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold leading-snug text-foreground sm:text-2xl">{name}</h1>
              <p className="mt-0.5 text-sm text-[#65676B]">ملف العائلة</p>
            </div>
            {family?.profile_complete ? (
              <Badge variant="success">الملف مكتمل</Badge>
            ) : (
              <Badge variant="warning">الملف غير مكتمل</Badge>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-1 text-lg font-bold">بيانات رب الأسرة</h2>
        <p className="mb-3 text-sm text-muted-foreground">كل الحقول المعتمدة لهذا المخيم.</p>
        <dl>
          <Row label="رقم الدخول" value={formatLoginSerial(family)} mono />
          {fields.map((field) => (
            <Row
              key={field.key}
              label={field.label || field.key}
              value={displayField(field, family)}
              mono={isMono(field.key)}
            />
          ))}
          {extraEntries.map(([key, value]) => (
            <Row key={key} label={key} value={String(value)} />
          ))}
        </dl>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">أفراد الأسرة</h2>
          <span className="text-sm tabular-nums text-[#65676B]">{members.length}</span>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد أفراد مسجّلون لهذه الأسرة.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {members.map((m) => (
              <li key={m.id} className="rounded-xl bg-[#F0F2F5] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{m.name || 'بدون اسم'}</p>
                    <p className="truncate text-xs text-[#65676B]">{relationshipLabel(m.relationship)}</p>
                  </div>
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#65676B]">الجنس</dt>
                    <dd className="font-medium">{genderLabel(m.gender)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#65676B]">تاريخ الميلاد</dt>
                    <dd className="font-medium">{formatDay(m.date_of_birth)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#65676B]">العمر</dt>
                    <dd className="font-medium">{m.age_display ?? m.age ?? '—'}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-3 text-lg font-bold">الطرود</h2>
        <DistributionList title="تم الاستلام" items={received} empty="لا يوجد طرود مسجّلة كمستلمة بعد." tone="success" />
        <DistributionList title="قيد الانتظار" items={pending} empty="لا يوجد طرود بانتظار الاستلام." tone="warning" className="mt-4" />
        {other.length > 0 ? (
          <DistributionList title="حالات أخرى" items={other} empty="" tone="default" className="mt-4" />
        ) : null}
      </section>
    </div>
  );
}

function DistributionList({ title, items, empty, tone, className = '' }) {
  const badgeVariant = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'default';
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        empty ? <p className="mt-2 text-sm text-muted-foreground">{empty}</p> : null
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0F2F5] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="font-semibold">{d.package_type?.name || d.package_label || 'طرد'}</p>
                <p className="mt-0.5 text-xs text-[#65676B]">
                  {d.delivered_at ? formatDate(d.delivered_at) : formatDate(d.created_at || d.updated_at)}
                  {d.camp_filter_record?.name ? ` — ${d.camp_filter_record.name}` : ''}
                </p>
              </div>
              <Badge variant={badgeVariant}>{distLabel(d.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
