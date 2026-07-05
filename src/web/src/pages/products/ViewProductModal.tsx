import { Modal } from '../../components/ui/Modal';
import { LogoThumb } from '../../components/ui/LogoThumb';
import { StatusBadge } from '../../components/ui/Badges';
import { AdminButton, IconAction } from '../../components/ui/Button';
import type { Product } from '../../types';

export function ViewProductModal({ product, onClose, onEdit }: { product: Product | null; onClose: () => void; onEdit: (p: Product) => void }) {
  if (!product) return null;
  const rows: [string, string][] = [
    ['ID', product.id], ['Kategorie', product.category], ['Hersteller', product.Hersteller],
    ['Power', (product.Power ?? '—') + (product.Unit ? ' ' + product.Unit : '')],
    ['Garantie', product.Garantie || '—'], ['Status', product.Status],
    ['Spezifikation', product.Spezifikation || '—'], ['Aktualisiert', product.updatedAt],
  ];
  if (product.category === 'Solarmodule') {
    rows.push(['Panel Höhe', (product.panelHeightMeters ?? '—') + ' m']);
    rows.push(['Panel Breite', (product.panelWidthMeters ?? '—') + ' m']);
  }
  return (
    <Modal open onClose={onClose} width={560}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
        <LogoThumb src={product.Logo} name={product.Hersteller} size={52} />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>{product.Header}</h2>
          <div style={{ marginTop: 4 }}><StatusBadge status={product.Status} /></div>
        </div>
        <IconAction icon="x" label="Schließen" onClick={onClose} />
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--gray-mid)', lineHeight: 1.55 }}>{product.Beschreibung}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--gray-300)', paddingBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-mid)' }}>{k}</span>
            <span style={{ fontSize: 13, color: 'var(--charcoal)', fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <AdminButton variant="ghost" onClick={onClose}>Schließen</AdminButton>
        <AdminButton variant="primary" icon="edit" onClick={() => onEdit(product)}>Bearbeiten</AdminButton>
      </div>
    </Modal>
  );
}
