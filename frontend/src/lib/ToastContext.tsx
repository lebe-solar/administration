import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; type: ToastType; msg: string }

const ToastCtx = createContext<{ pushToast: (type: ToastType, msg: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((type: ToastType, msg: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 300 }}>
        {toasts.map(t => {
          const map: Record<ToastType, [string, string]> = { success: ['#1f8a5b', 'check'], error: ['#c0392b', 'alert'], info: ['var(--sage)', 'file'] };
          const [c, ic] = map[t.type] || map.info;
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-raised)', minWidth: 260, animation: 'admslide .25s ease' }}>
              <Icon name={ic} size={18} color={c} />
              <span style={{ fontSize: 14, color: 'var(--charcoal)', fontWeight: 500 }}>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
