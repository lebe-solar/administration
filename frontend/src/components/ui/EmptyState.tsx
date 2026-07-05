import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
      <span style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--cream)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name={icon} size={30} /></span>
      <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700, color: 'var(--charcoal)' }}>{title}</h3>
      <p style={{ margin: '0 auto 20px', fontSize: 14.5, color: 'var(--gray-mid)', maxWidth: 420, lineHeight: 1.5 }}>{text}</p>
      {action}
    </div>
  );
}
