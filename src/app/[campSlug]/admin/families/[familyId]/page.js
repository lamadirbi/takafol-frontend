'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminShell from '@/components/layout/AdminShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/EmptyState';
import FamilyProfileView from '@/components/admin/FamilyProfileView';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { getApiErrorMessage, unwrapResource } from '@/lib/utils';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { adminGuideHref, adminGuideSections } from '@/components/guide/adminGuide';

const AdminFamilyManageModal = dynamic(() => import('@/components/admin/AdminFamilyManageModal'), {
  ssr: false,
});

export default function AdminFamilyProfilePage() {
  const { campSlug, familyId } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const { camp } = useCamp();

  const [family, setFamily] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [familyRes, schemaRes] = await Promise.all([
        api.get(`/admin/families/${familyId}`),
        api.get('/admin/family-form-schema'),
      ]);
      setFamily(unwrapResource(familyRes.data));
      setSchema(schemaRes.data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل بيانات العائلة.'));
      setFamily(null);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell
      title={family ? `ملف عائلة ${family.head_name}` : 'ملف العائلة'}
      subtitle={camp?.name}
      extras={
        <AdminFamilyManageModal
          open={editOpen}
          familyId={editOpen ? familyId : null}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            load();
          }}
        />
      }
    >
      <PageGuidePanel
        sections={adminGuideSections(base)}
        sectionId="family-file"
        guideHref={adminGuideHref(base)}
      />
      <div className="mb-4">
        <Link
          href={`${base}/admin/families`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
        >
          العودة لسجل العائلات
        </Link>
        {family ? (
          <p className="text-sm text-muted-foreground">ملف الأسرة الكامل: البيانات، الأفراد، رقم الدخول، والطرود.</p>
        ) : null}
      </div>

      {loading ? <PageSpinner label="جاري تحميل الملف" /> : null}
      {error ? <Alert>{error}</Alert> : null}
      {!loading && family ? (
        <FamilyProfileView
          family={family}
          schema={schema}
          actions={
            <Button
              type="button"
              variant="outline"
              className="border-0 bg-white shadow-sm hover:bg-[#F0F2F5]"
              onClick={() => setEditOpen(true)}
            >
              تعديل
            </Button>
          }
        />
      ) : null}
    </AdminShell>
  );
}
