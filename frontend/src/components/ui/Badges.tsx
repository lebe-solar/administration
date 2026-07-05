import { Icon } from './Icon';
import type { ProductStatus, Category } from '../../types';

const STATUS_STYLE: Record<string, { bg: string; fg: string; dot: string }> = {
  Active: { bg: 'rgba(31,138,91,0.14)', fg: '#1f8a5b', dot: '#1f8a5b' },
  Draft: { bg: 'rgba(181,137,0,0.16)', fg: '#9a7400', dot: '#c79400' },
  Hidden: { bg: 'rgba(135,135,135,0.16)', fg: '#6b6b6b', dot: '#9a9a9a' },
};

export function StatusBadge({ status }: { status: ProductStatus | string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Hidden;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: s.bg, color: s.fg, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{status}
    </span>
  );
}

const CAT_ICON: Record<string, string> = { Solarmodule: 'panel', Wechselrichter: 'inverter', Heimspeicher: 'battery', Ladestationen: 'plug', Heizsysteme: 'heat' };

export function CategoryTag({ category }: { category: Category['key'] | string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(159,178,161,0.20)', color: 'var(--charcoal)', fontSize: 12, fontWeight: 600 }}>
      <Icon name={CAT_ICON[category] || 'box'} size={13} strokeWidth={2.2} />{category}
    </span>
  );
}

export function AllowBadge({ allow }: { allow: boolean }) {
  return allow ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(31,138,91,0.14)', color: '#1f8a5b', fontSize: 12, fontWeight: 600 }}>
      <Icon name="edit" size={12} />Anpassbar
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(135,135,135,0.16)', color: '#6b6b6b', fontSize: 12, fontWeight: 600 }}>
      <Icon name="check" size={12} />Fixes Paket
    </span>
  );
}
