'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const CampContext = createContext();

export const CampProvider = ({ children, campSlug }) => {
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCamp = useCallback(async () => {
    if (!campSlug) return null;
    try {
      const response = await api.get(`/camps/${campSlug}`);
      setCamp(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch camp data:', error);
      return null;
    }
  }, [campSlug]);

  useEffect(() => {
    const fetchCamp = async () => {
      setLoading(true);
      try {
        await refreshCamp();
      } finally {
        setLoading(false);
      }
    };

    if (campSlug) {
      fetchCamp();
    }
  }, [campSlug, refreshCamp]);

  return (
    <CampContext.Provider value={{ camp, loading, refreshCamp }}>
      {children}
    </CampContext.Provider>
  );
};

export const useCamp = () => useContext(CampContext);
