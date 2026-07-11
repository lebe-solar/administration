import type { ReactNode } from 'react';

export function Tag({ children }: { children?: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}
