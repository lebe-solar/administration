import type { ReactNode } from 'react';
import { IconAction } from '../ui/Button';

export function Topbar({ title, subtitle, action, onMenu, mobile }: { title: string; subtitle?: string; action?: ReactNode; onMenu: () => void; mobile: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {mobile && <IconAction icon="menu" label="Menü" onClick={onMenu} />}
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--charcoal)' }}>{title}</h1>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14.5, color: 'var(--gray-mid)' }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
