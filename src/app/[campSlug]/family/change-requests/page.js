'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import FamilyShell, { FamilyToolbar } from '@/components/layout/FamilyShell';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/ui/LogoutButton';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import EmptyState, { PageSpinner } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, getApiErrorMessage, unwrapApiList } from '@/lib/utils';
import ChangeRequestPayloadDetails from '@/components/shared/ChangeRequestPayloadDetails';

function statusLabel(status) {
  const s = String(status ?? '');
  if (s === 'pending') return 'قيد المراجعة';
  if (s === 'approved') return 'تم القبول';
  if (s === 'rejected') return 'مرفوض';
  if (s === 'cancelled') return 'ملغى';
  return s || '—';
}

function statusBadgeVariant(status) {
  const s = String(status ?? '');
  if (s === 'pending') return 'warning';
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  return 'default';
}

function summarizePayload(payload, memberNameById = {}) {
  if (!payload || typeof payload !== 'object') return '—';
  const parts = [];
  const collectNames = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => String(x?.name ?? '').trim())
      .filter(Boolean);

  const fam = payload.family;
  if (fam && typeof fam === 'object' && Object.keys(fam).length > 0) {
    parts.push(`تعديل بيانات العائلة (${Object.keys(fam).length} حقل)`);
  }
  const m = payload.members;
  if (m && typeof m === 'object') {
    const a = Array.isArray(m.add) ? m.add.length : 0;
    const u = Array.isArray(m.update) ? m.update.length : 0;
    const d = Array.isArray(m.delete) ? m.delete.length : 0;
    const addNames = collectNames(m.add);
    const updateRows = Array.isArray(m.update) ? m.update : [];
    const updateNames = collectNames(updateRows).concat(
      updateRows
        .filter((x) => !x?.name && x?.id != null)
        .map((x) => memberNameById[String(x.id)] || memberNameById[x.id] || '')
        .filter(Boolean)
    );
    if (a) {
      parts.push(`إضافة ${a} فرد${addNames.length ? ` (${addNames.join('، ')})` : ''}`);
    }
    if (u) {
      parts.push(`تعديل ${u} فرد${updateNames.length ? ` (${updateNames.join('، ')})` : ''}`);
    }
    if (d) parts.push(`طلب حذف ${d} فرد`);
  }
  return parts.length ? parts.join(' — ') : 'طلب مراجعة بيانات';
}

export default function FamilyChangeRequestsPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp } = useCamp();
  const { user, logout, isFamilyHead } = useAuth();

  const [items, setItems] = useState([]);
  const [memberNameById, setMemberNameById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [res, dashRes] = await Promise.all([
        api.get('/family/change-requests', { params: { per_page: 50 } }),
        api.get('/family/dashboard').catch(() => null),
      ]);
      setItems(unwrapApiList(res));
      const rawFamily = dashRes?.data?.family?.data ?? dashRes?.data?.family ?? null;
      const members = Array.isArray(rawFamily?.members?.data)
        ? rawFamily.members.data
        : Array.isArray(rawFamily?.members)
          ? rawFamily.members
          : [];
      const map = members.reduce((acc, m) => {
        if (m?.id != null && m?.name) {
          acc[String(m.id)] = String(m.name);
        }
        return acc;
      }, {});
      setMemberNameById(map);
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل الطلبات.'));
      setItems([]);
      setMemberNameById({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user || !isFamilyHead) {
    return (
      <FamilyShell title="طلبات التعديل" subtitle={camp?.name} maxWidth="max-w-lg">
        <p className="text-center text-muted-foreground">يجب تسجيل الدخول كرب أسرة.</p>
        <Link href={`/${campSlug}/login`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center font-bold text-primary">
          الانتقال لتسجيل الدخول
        </Link>
      </FamilyShell>
    );
  }

  return (
    <FamilyShell
      title="سجل طلبات التعديل"
      subtitle={camp?.name}
      maxWidth="max-w-3xl"
      toolbar={
        <FamilyToolbar maxWidth="max-w-3xl">
          <Link
            href={`/${campSlug}/family/dashboard`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
          >
            ← لوحة رب الأسرة
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${campSlug}/family/change-request`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
            >
              طلب تعديل جديد
            </Link>
            <LogoutButton label="خروج" onLogout={() => logout(`/${campSlug}/login`)} />
          </div>
        </FamilyToolbar>
      }
    >
        <h1 className="text-2xl font-bold text-foreground">سجل طلبات تعديل البيانات</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          تُحفظ الطلبات هنا حتى تُراجعها الإدارة؛ عند القبول تُطبَّق التعديلات على السجل الرسمي.
        </p>

        {loading ? <PageSpinner /> : null}

        {error ? (
          <Alert className="mt-6">{error}</Alert>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="لا توجد طلبات بعد."
            action={
              <Button type="button" onClick={() => router.push(`/${campSlug}/family/change-request`)}>
                إرسال طلب تعديل
              </Button>
            }
          />
        ) : null}

        {!loading && items.length > 0 ? (
          <ul className="mt-8 space-y-4">
            {items.map((row) => (
              <li
                key={row.id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-500">طلب #{row.id}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      أُرسل: {row.created_at ? formatDate(row.created_at) : '—'}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">{summarizePayload(row.payload, memberNameById)}</p>
                {row.status === 'pending' ? (
                  <p className="mt-2 text-xs text-amber-800">بانتظار موافقة الإدارة على هذا الطلب.</p>
                ) : null}
                {row.review_note ? (
                  <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">ملاحظة الإدارة: </span>
                    {row.review_note}
                  </p>
                ) : null}
                {row.reviewed_at ? (
                  <p className="mt-2 text-xs text-slate-500">
                    تاريخ الرد: {formatDate(row.reviewed_at)}
                  </p>
                ) : null}
                {row.payload && Object.keys(row.payload).length > 0 ? (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-medium text-primary">تفاصيل الطلب (للاطلاع)</summary>
                    <div className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <ChangeRequestPayloadDetails payload={row.payload} memberNameById={memberNameById} />
                    </div>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
    </FamilyShell>
  );
}
