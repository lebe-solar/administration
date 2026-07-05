import type { ReactNode, MouseEvent } from 'react';

export function Modal({ open, onClose, children, width = 460 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(60,60,59,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div onClick={(e: MouseEvent) => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, width: `min(${width}px, 100%)`, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-raised)' }}>
        {children}
      </div>
    </div>
  );
}
