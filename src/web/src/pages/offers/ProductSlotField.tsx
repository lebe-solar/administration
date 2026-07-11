import { Icon } from '../../components/ui/Icon';
import { SelectInput, TextInput } from '../../components/ui/Fields';
import { ProductCard } from '../../components/ui/ProductCard';
import type { Slot } from './offerUtils';
import type { Product } from '../../types';

export function ProductSlotField({ slot, products, idVal, countVal, onChange }: {
  slot: Slot; products: Product[]; idVal?: string | null; countVal?: number;
  onChange: (key: string, id: string | null, count: number) => void;
}) {
  const opts = products.filter(p => p.category === slot.cat);
  const sel = idVal ? products.find(p => p.id === idVal) : null;
  return (
    <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={slot.icon} size={15} /></span>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{slot.label}</span>
        {slot.optional && <span style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>optional</span>}
      </div>
      {opts.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', padding: '10px 0' }}>Keine Produkte in dieser Kategorie verfügbar.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px', gap: 10 }}>
          <SelectInput value={idVal || ''} onChange={e => onChange(slot.key, e.target.value || null, e.target.value ? (countVal || 1) : 0)}>
            <option value="">— nicht enthalten —</option>
            {opts.map(p => <option key={p.id} value={p.id}>{p.Header}</option>)}
          </SelectInput>
          <TextInput type="number" min="0" value={idVal ? (countVal || 1) : 0} disabled={!idVal} placeholder="Anz." onChange={e => onChange(slot.key, idVal ?? null, Number(e.target.value))} />
        </div>
      )}
      {sel && <div style={{ marginTop: 12 }}><ProductCard product={sel} quantity={countVal || 1} /></div>}
    </div>
  );
}
