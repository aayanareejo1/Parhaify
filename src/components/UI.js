import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

// ── Toast ──────────────────────────────────────────────────────
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'success' && <span style={{ color: 'var(--success)' }}>✓</span>}
            {t.type === 'error' && <span style={{ color: 'var(--danger)' }}>✕</span>}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, maxWidth = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) { document.addEventListener('keydown', handler); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: `min(${maxWidth}px, calc(100vw - 32px))` }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" style={{ minWidth: 44, minHeight: 44 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Delete</button>
      </>}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{message}</p>
    </Modal>
  );
}
