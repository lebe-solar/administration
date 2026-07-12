import type { ReactNode } from 'react';

interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  align?: 'left' | 'center';
  valueColor?: string;
}

/** Small label-over-value stat display used across offer/simulator summaries. */
export function StatTile({ label, value, align = 'left', valueColor = 'var(--charcoal)' }: StatTileProps) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: valueColor }}>{value}</div>
    </div>
  );
}
