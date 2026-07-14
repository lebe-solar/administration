import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badges';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ProductCard } from '../../components/ui/ProductCard';
import type { Product } from '../../types';

export function ViewProductModal({ product, onClose, onEdit }: { product: Product | null; onClose: () => void; onEdit: (p: Product) => void }) {
  if (!product) return null;
  const meta: [string, string][] = [
    ['ID', product.id], ['Kategorie', product.category], ['Aktualisiert', product.updatedAt],
  ];
  if (product.category === 'Solarmodule') {
    meta.push(['Panel Höhe', (product.panelHeightMeters ?? '—') + ' m']);
    meta.push(['Panel Breite', (product.panelWidthMeters ?? '—') + ' m']);
  }
  return (
    <Modal open onClose={onClose} width={420}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ flex: 1 }}><StatusBadge status={product.Status} /></div>
        <IconAction icon="x" label="Schließen" onClick={onClose} />
      </div>
      <ProductCard product={product} style={{ boxShadow: 'none', border: '1px solid var(--gray-300)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginTop: 16 }}>
        {meta.map(([k, v]) => (
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
