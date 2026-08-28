'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeading from '@/components/ui/PageHeading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CampAdminModal from '@/components/admin/CampAdminModal';
import { IconPlus } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage, unwrapApiList } from '@/lib/utils';
import { useParams } from 'next/navigation';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { adminGuideHref, adminGuideSections } from '@/components/guide/adminGuide';

export default function AdminUsersPage() {
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { camp } = useCamp();
  const { user, refresh } = useAuth();

  const canAdd = Boolean(user?.can_add_camp_admins);
  const isGlobalSuper = Boolean(user?.is_super && user?.camp_id == null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setAdmins(unwrapApiList(response));
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    refresh?.();
  }, [refresh]);

  const handleDelete = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/admin/users/${adminToDelete.id}`);
      setAdminToDelete(null);
      await fetchAdmins();
      await refresh?.();
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'تعذر حذف المسؤول.'));
    } finally {
      setDeleting(false);
    }
  };

  function canEditRow(row) {
    if (!row) return false;
    if (isGlobalSuper) return true;
    if (canAdd) return true;
    return Number(user?.id) === Number(row.id);
  }

  const columns = [
    { key: 'name', label: 'الاسم الكامل' },
    {
      key: 'username',
      label: 'اسم المستخدم',
      render: (row) => <span dir="ltr">{row.username || '—'}</span>,
    },
    {
      key: 'rank',
      label: 'الصلاحية',
      render: (row) => {
        if (row.is_primary_camp_admin) {
          return <Badge variant="primary">مسؤول رئيسي للمخيم</Badge>;
        }
        if (row.is_super) {
          return <Badge variant="secondary">مسؤول فائق</Badge>;
        }
        return <Badge variant="secondary">مسؤول</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {canEditRow(row) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingAdmin(row);
                setModalOpen(true);
              }}
            >
              تعديل
            </Button>
          ) : null}
          {!row.is_primary_camp_admin && canAdd ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                setDeleteError('');
                setAdminToDelete(row);
              }}
            >
              حذف
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="إدارة المسؤولين"
      subtitle={camp?.name}
      extras={
        <>
          <CampAdminModal
            open={modalOpen}
            admin={editingAdmin}
            allowSuper={isGlobalSuper}
            onClose={() => {
              setModalOpen(false);
              setEditingAdmin(null);
            }}
            onSaved={() => {
              fetchAdmins();
              refresh?.();
            }}
          />
          <ConfirmDialog
            open={adminToDelete !== null}
            onClose={() => !deleting && setAdminToDelete(null)}
            onConfirm={handleDelete}
            loading={deleting}
            title="حذف المسؤول"
            message={
              deleteError
                ? deleteError
                : `هل أنت متأكد من حذف المسؤول "${adminToDelete?.name}"؟ سيفقد صلاحية الدخول تماماً.`
            }
            confirmLabel="حذف"
            danger
          />
        </>
      }
    >
      <PageGuidePanel
        sections={adminGuideSections(base)}
        sectionId="admins"
        guideHref={adminGuideHref(base)}
      />
      <PageHeading
        title={`المسؤولين في ${camp?.name || ''}`}
        description="المسؤول الرئيسي يضيف مديراً ثانياً، يشوف اسمه واسم المستخدم وكلمة السر، ويقدر يعدّل بياناته لاحقاً. كلمة السر تظهر عند الإنشاء أو عند تعيين كلمة جديدة فقط."
        actions={
          canAdd ? (
            <Button
              onClick={() => {
                setEditingAdmin(null);
                setModalOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <IconPlus className="h-4 w-4" /> إضافة مسؤول جديد
            </Button>
          ) : null
        }
      />
      <Table
        columns={columns}
        rows={admins}
        loading={loading}
        emptyMessage="لا يوجد مسؤولين حالياً."
      />
    </AdminShell>
  );
}
