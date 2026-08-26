'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeading from '@/components/ui/PageHeading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AddAdminModal from '@/components/admin/AddAdminModal';
import { IconPlus } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage, unwrapApiList } from '@/lib/utils';

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { camp } = useCamp();
  const { user, refresh } = useAuth();

  const canAdd = Boolean(user?.can_add_camp_admins);

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

  const columns = [
    { key: 'name', label: 'الاسم الكامل' },
    { key: 'username', label: 'اسم المستخدم' },
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
      render: (row) => {
        if (row.is_primary_camp_admin) {
          return (
            <span className="text-xs text-slate-500" title="لا يمكن حذف المسؤول الرئيسي">
              —
            </span>
          );
        }
        if (!canAdd) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600"
            onClick={() => {
              setDeleteError('');
              setAdminToDelete(row);
            }}
          >
            حذف
          </Button>
        );
      },
    },
  ];

  return (
    <AdminShell
      title="إدارة المسؤولين"
      subtitle={camp?.name}
      extras={
        <>
          {canAdd ? (
            <AddAdminModal
              open={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onCreated={() => {
                fetchAdmins();
                refresh?.();
              }}
            />
          ) : null}
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
      <PageHeading
        title={`المسؤولين في ${camp?.name || ''}`}
        description="المسؤول الرئيسي للمخيم فقط يمكنه إضافة مسؤولين جدد. لا يمكن لأحد حذف المسؤول الرئيسي."
        actions={
          canAdd ? (
            <Button onClick={() => setIsAddModalOpen(true)}>
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
