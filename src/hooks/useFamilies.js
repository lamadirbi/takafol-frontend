'use client';

import { useCallback, useRef, useState } from 'react';
import { api } from '@/lib/api';

const defaultFilters = {
  social_status: '',
  financial_status: '',
  members_min: '',
  members_max: '',
  has_newborn: false,
  member_is_newborn: false,
  child_age_min: '',
  child_age_max: '',
  member_gender: '',
  /** @type {string[]} */
  member_relationships: [],
};

/** @typedef {'family' | 'members'} FilterMode */

export function useFamilies() {
  const [filters, setFilters] = useState(defaultFilters);
  const [filterMode, setFilterModeState] = useState(
    /** @type {FilterMode} */ ('family')
  );
  const prevModeRef = useRef(
    /** @type {FilterMode} */ ('family')
  );

  const setFilterMode = useCallback((mode) => {
    const prev = prevModeRef.current;
    prevModeRef.current = mode;
    setFilterModeState(mode);
    if (prev === 'family' && mode === 'members') {
      setFilters((f) => ({ ...f, member_relationships: [] }));
    }
  }, []);
  /** بحث في قائمة العائلات (هوية / اسم) — يُستخدم في صفحة إدارة العائلات */
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleMemberRelationship = useCallback((value, checked) => {
    setFilters((prev) => {
      const next = new Set(prev.member_relationships || []);
      if (checked) next.add(value);
      else next.delete(value);
      return { ...prev, member_relationships: Array.from(next) };
    });
  }, []);

  /** بناء معاملات GET بشكل صريح (مصفوفات + أرقام) ليعالجها Laravel بشكل صحيح */
  const buildRequestParams = useCallback(
    (pageNum) => {
      const p = {
        page: String(pageNum),
        filter_scope: filterMode === 'members' ? 'members' : 'family',
      };
      if (filterMode === 'family') {
        ['social_status', 'financial_status', 'members_min', 'members_max'].forEach((k) => {
          const v = filters[k];
          if (v !== '' && v !== null && v !== undefined) p[k] = String(v);
        });
        if (filters.has_newborn) {
          p.has_newborn = '1';
        }
      } else {
        if (filters.member_is_newborn) {
          p.member_is_newborn = '1';
        }
        const amin = filters.child_age_min;
        const amax = filters.child_age_max;
        const gen = filters.member_gender;
        if (amin !== '' && amin !== null && amin !== undefined) {
          p.child_age_min = String(amin);
        }
        if (amax !== '' && amax !== null && amax !== undefined) {
          p.child_age_max = String(amax);
        }
        if (gen !== '' && gen !== null && gen !== undefined) {
          p.member_gender = String(gen);
        }
        const rels = filters.member_relationships || [];
        if (rels.length) {
          p.member_relationships = rels.filter(Boolean);
        }
      }
      const q = search.trim();
      if (q) p.search = q;
      return p;
    },
    [filters, filterMode, search]
  );

  const fetchPage = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const { data: payload } = await api.get('/admin/families', {
          params: buildRequestParams(page),
        });
        setData(payload);
        return payload;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [buildRequestParams]
  );

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  return {
    filters,
    setFilter,
    resetFilters,
    filterMode,
    setFilterMode,
    toggleMemberRelationship,
    search,
    setSearch,
    data,
    loading,
    error,
    fetchPage,
  };
}
