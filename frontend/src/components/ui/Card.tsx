import type { ReactNode, CSSProperties } from 'react';

export function Card({ children, style, pad = 22 }: { children?: ReactNode; style?: CSSProperties; pad?: number }) {
  return <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: pad, ...style }}>{children}</div>;
}
