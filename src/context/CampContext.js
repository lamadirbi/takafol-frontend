'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const CampContext = createContext();
const CAMP_CACHE_MS = 60_000;

function cacheKey(slug) {
  return `takafol_camp_${slug}`;
}

function readCampCache(slug) {
  try {
    const raw = sessionStorage.getItem(cacheKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data) return null;
    return {
      data: parsed.data,
      fresh: Date.now() - Number(parsed.ts || 0) < CAMP_CACHE_MS,
    };
  } catch {
    return null;
  }
}

function writeCampCache(slug, data) {
  if (!data) return;
  try {
    sessionStorage.setItem(cacheKey(slug), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* quota / private mode */
  }
}

export const CampProvider = ({ children, campSlug }) => {
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(Boolean(campSlug));

  const refreshCamp = useCallback(async () => {
    if (!campSlug) return null;
    try {
      const response = await api.get(`/camps/${campSlug}`);
      setCamp(response.data);
      writeCampCache(campSlug, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch camp data:', error);
      return null;
    }
  }, [campSlug]);

  useEffect(() => {
    if (!campSlug) {
      setLoading(false);
      return;
    }

    const cached = readCampCache(campSlug);
    if (cached?.data) {
      setCamp(cached.data);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;
    (async () => {
      try {
        await refreshCamp();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campSlug, refreshCamp]);

  return (
    <CampContext.Provider value={{ camp, loading, refreshCamp }}>
      {children}
    </CampContext.Provider>
  );
};

export const useCamp = () => useContext(CampContext);
