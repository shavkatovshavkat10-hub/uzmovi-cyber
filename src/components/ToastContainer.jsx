import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--neon-cyan)' }}></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
