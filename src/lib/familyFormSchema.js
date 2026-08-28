export function enabledFamilyFields(schema) {
  const list = schema?.enabled_fields || (schema?.fields || []).filter((f) => f.enabled);
  return Array.isArray(list) ? list : [];
}

export function familyFieldValue(family, key) {
  if (!family) return '';
  if (key === 'date_of_birth') {
    if (family.date_of_birth) return String(family.date_of_birth).slice(0, 10);
    const head = (family.members || []).find((m) => m.relationship === 'رب الأسرة');
    return head?.date_of_birth ? String(head.date_of_birth).slice(0, 10) : '';
  }
  if (family[key] != null && family[key] !== '') return family[key];
  const extra = family.extra_data && typeof family.extra_data === 'object' ? family.extra_data : {};
  if (extra[key] != null && extra[key] !== '') return extra[key];
  return '';
}

export function formFromFamily(fields, family, extras = {}) {
  const form = { ...extras };
  for (const field of fields) {
    const v = familyFieldValue(family, field.key);
    form[field.key] = v == null ? '' : String(v);
  }
  return form;
}

export function buildFamilyPayload(fields, form) {
  const payload = {};
  const extra = {};
  for (const field of fields) {
    if (!field.enabled) continue;
    const raw = form[field.key];
    const value = raw === '' || raw == null ? null : raw;
    if (field.source === 'custom') {
      extra[field.key] = value;
    } else {
      payload[field.key] = value;
    }
  }
  if (Object.keys(extra).length) payload.extra_data = extra;
  return payload;
}

export function isFamilyFieldMissing(field, value) {
  if (!field?.required) return false;
  return String(value ?? '').trim() === '';
}
