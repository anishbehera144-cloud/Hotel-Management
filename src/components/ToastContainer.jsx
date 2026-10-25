import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="var(--status-emerald)" />,
    warning: <AlertTriangle size={18} color="var(--status-amber)" />,
    error: <XCircle size={18} color="var(--status-crimson)" />,
    info: <Info size={18} color="var(--status-sky)" />,
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type}`}>
          {iconMap[t.type] || iconMap.info}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="toast-title">{t.title}</div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.time}</span>
            </div>
            <div className="toast-msg">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
