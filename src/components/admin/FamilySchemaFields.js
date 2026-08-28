'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { isFamilyFieldMissing } from '@/lib/familyFormSchema';

export default function FamilySchemaFields({ fields, values, onChange, attempted = false, hideKeys = [] }) {
  const hidden = new Set(hideKeys);
  const list = (fields || []).filter((f) => f.enabled && !hidden.has(f.key));

  return (
    <>
      {list.map((field) => {
        const value = values[field.key] ?? '';
        const error = attempted && isFamilyFieldMissing(field, value) ? 'مطلوب' : '';
        const label = field.required ? `${field.label} *` : field.label;
        if (field.type === 'select') {
          const options = [
            { value: '', label: '—' },
            ...(field.options || []),
          ];
          return (
            <Select
              key={field.key}
              label={label}
              name={field.key}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              options={options}
              error={error}
              required={field.required}
            />
          );
        }
        return (
          <Input
            key={field.key}
            label={label}
            name={field.key}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            error={error}
            required={field.required}
            inputMode={field.key === 'phone' ? 'tel' : field.type === 'number' ? 'numeric' : undefined}
          />
        );
      })}
    </>
  );
}
