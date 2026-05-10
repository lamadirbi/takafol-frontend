'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AddAdminModal from '@/components/admin/AddAdminModal';
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
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="إدارة المسؤولين" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">المسؤولين في {camp?.name}</h1>
              <p className="mt-1 text-slate-500">
                المسؤول الرئيسي للمخيم فقط يمكنه إضافة مسؤولين جدد. لا يمكن لأحد حذف المسؤول الرئيسي.
              </p>
            </div>
            {canAdd ? (
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl px-6">
                + إضافة مسؤول جديد
              </Button>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Table
              columns={columns}
              rows={admins}
              loading={loading}
              emptyMessage="لا يوجد مسؤولين حالياً."
            />
          </div>
        </main>

        <Footer />
      </div>

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
    </div>
  );
}
