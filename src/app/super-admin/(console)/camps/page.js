'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import NameList from '@/components/super-admin/NameList';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import { readCachedAdminCamps, writeCachedAdminCamps } from '@/lib/authCache';

export default function SuperAdminCampsPage() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampSlug, setNewCampSlug] = useState('');
  const [newSubUntil, setNewSubUntil] = useState('');
  const [newPayWa, setNewPayWa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCamps = useCallback(async () => {
    try {
      const response = await api.get('/admin/camps');
      const list = Array.isArray(response.data) ? response.data : [];
      setCamps(list);
      writeCachedAdminCamps(list);
    } catch {
      setCamps((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    const cached = readCachedAdminCamps();
    if (cached.length) {
      setCamps(cached);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/camps', {
        name: newCampName,
        slug: newCampSlug,
        is_active: true,
        ...(newSubUntil.trim() ? { subscription_valid_until: newSubUntil.trim() } : {}),
        ...(newPayWa.trim() ? { payment_notification_whatsapp: newPayWa.trim() } : {}),
      });
      setIsModalOpen(false);
      setNewCampName('');
      setNewCampSlug('');
      setNewSubUntil('');
      setNewPayWa('');
      fetchCamps();
    } catch (err) {
      setError(getApiErrorMessage(err, 'فشل إنشاء المخيم.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SuperAdminShell
      title="المخيمات"
      description="اضغط اسم المخيم لعرض بياناته"
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          + مخيم جديد
        </Button>
      }
      extras={
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء مخيم">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              required
              label="اسم المخيم"
              id="new-camp-name"
              value={newCampName}
              onChange={(e) => setNewCampName(e.target.value)}
            />
            <Input
              required
              id="new-camp-slug"
              label="Slug (إنجليزي)"
              value={newCampSlug}
              onChange={(e) => setNewCampSlug(e.target.value)}
              dir="ltr"
              inputClassName="text-left"
            />
            <Input
              id="new-sub-until"
              type="date"
              label="صلاحية اشتراك العائلات حتى (اختياري)"
              value={newSubUntil}
              onChange={(e) => setNewSubUntil(e.target.value)}
              dir="ltr"
              inputClassName="text-left"
            />
            <Input
              id="new-pay-wa"
              label="واتساب إشعارات الدفع (اختياري)"
              value={newPayWa}
              onChange={(e) => setNewPayWa(e.target.value)}
              dir="ltr"
              placeholder="059xxxxxxxx"
              inputClassName="text-left"
            />
            {error ? <Alert>{error}</Alert> : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} loading={submitting}>
                إنشاء
              </Button>
            </div>
          </form>
        </Modal>
      }
    >
      <NameList
        title="اسم المخيم"
        items={camps}
        loading={loading}
        emptyMessage="لا توجد مخيمات."
        getId={(c) => c.id}
        getTitle={(c) => c.name}
        hrefFor={(c) => `/super-admin/camps/${c.id}`}
      />
    </SuperAdminShell>
  );
}
