'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import MessageDialog from '@/components/ui/MessageDialog';

const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: 'تنبيه',
    message: '',
  });

  const showNotice = useCallback((message, title = 'تنبيه') => {
    setState({
      open: true,
      title: title || 'تنبيه',
      message: message == null ? '' : String(message),
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NoticeContext.Provider value={showNotice}>
      {children}
      <MessageDialog
        open={state.open}
        onClose={close}
        title={state.title}
        message={state.message}
        nested
      />
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const showNotice = useContext(NoticeContext);
  if (!showNotice) {
    throw new Error('useNotice must be used within NoticeProvider');
  }
  return showNotice;
}
