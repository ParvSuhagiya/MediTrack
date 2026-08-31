import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toastMessage, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}
