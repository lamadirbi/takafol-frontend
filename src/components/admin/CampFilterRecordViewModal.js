'use client';

import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { formatDate } from '@/lib/utils';

const GENDER_AR = { male: 'ذكر', female: 'أنثى' };

function countResults(row) {
  const snap = row?.snapshot;
  if (!snap) return '—';
  const scope = row?.criteria?.filter_scope || 'family';
  if (scope === 'members') {
    let n = 0;
    for (const f of snap.families || []) {
      n += (f.members || []).length;
    }
    return String(n);
  }
  return String(snap.families_count ?? (snap.families || []).length ?? 0);
}

export default function CampFilterRecordViewModal({ open, record, onClose }) {
  if (!record) return null;

  const snap = record.snapshot || {};
  const families = snap.families || [];
  const scope = record.criteria?.filter_scope || 'family';

  const familyColumns = [
    { key: 'head_name', label: 'رب الأسرة' },
    { key: 'national_id', label: 'الهوية' },
    { key: 'phone', label: 'الجوال' },
    { key: 'total_members', label: 'الأفراد' },
  ];

  const memberRows = [];
  if (scope === 'members') {
    for (const fam of families) {
      for (const m of fam.members || []) {
        memberRows.push({
          id: `${fam.id}-${m.id}`,
          mname: m.name,
          age: m.age ?? '—',
          gender: GENDER_AR[m.gender] || m.gender || '—',
          rel: m.relationship || '—',
          head: fam.head_name,
          nid: fam.national_id,
        });
      }
    }
  }

  const memberColumns = [
    { key: 'mname', label: 'الفرد' },
    { key: 'age', label: 'العمر' },
    { key: 'gender', label: 'الجنس' },
    { key: 'rel', label: 'الصلة' },
    { key: 'head', label: 'رب الأسرة' },
    { key: 'nid', label: 'هوية الأسرة' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record.name || 'تفاصيل السجل'}
      className="max-w-4xl overflow-hidden"
    >
      <div className="max-h-[75vh] space-y-4 overflow-y-auto p-1" dir="rtl">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold">تاريخ الإنشاء:</span> {formatDate(record.created_at)}
          </p>
          <p className="mt-1">
            <span className="font-semibold">النطاق:</span>{' '}
            {scope === 'members' ? 'أفراد' : 'عائلات'} —{' '}
            <span className="font-semibold">عدد النتائج:</span> {countResults(record)}
          </p>
          {snap.limit_applied ? (
            <p className="mt-1 text-amber-800">حد أقصى للعينة: {snap.limit_applied}</p>
          ) : null}
        </div>
        {scope === 'family' ? (
          <Table columns={familyColumns} rows={families} emptyMessage="لا بيانات في اللقطة." />
        ) : (
          <Table columns={memberColumns} rows={memberRows} emptyMessage="لا بيانات في اللقطة." />
        )}
      </div>
    </Modal>
  );
}
