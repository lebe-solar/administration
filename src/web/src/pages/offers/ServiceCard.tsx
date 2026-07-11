import type { DragEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { IconAction } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Fields';
import type { OfferIncludedService, Visibility } from '../../types';

export interface DragHandlers {
  dragIndex: number | null;
  overIndex: number | null;
  start: (e: DragEvent, i: number) => void;
  over: (e: DragEvent, i: number) => void;
  drop: (e: DragEvent, i: number) => void;
  end: () => void;
}

const VISIBILITY_ORDER: Visibility[] = ['public', 'internal', 'hidden'];
const VISIBILITY_LABEL: Record<Visibility, string> = { public: 'öffentlich', internal: 'intern', hidden: 'verborgen' };

export function ServiceCard({ item, index, onChange, onDelete, onDuplicate, onSaveTemplate, drag }: {
  item: OfferIncludedService; index: number;
  onChange: (index: number, item: OfferIncludedService) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onSaveTemplate: (item: OfferIncludedService) => void;
  drag: DragHandlers;
}) {
  const set = <K extends keyof OfferIncludedService>(k: K, v: OfferIncludedService[K]) => onChange(index, { ...item, [k]: v });
  const setLine = (i: number, v: string) => { const l = [...item.descriptionLines]; l[i] = v; set('descriptionLines', l); };
  const addLine = () => set('descriptionLines', [...item.descriptionLines, '']);
  const delLine = (i: number) => set('descriptionLines', item.descriptionLines.filter((_, x) => x !== i));
  const cycleVisibility = () => set('visibility', VISIBILITY_ORDER[(VISIBILITY_ORDER.indexOf(item.visibility) + 1) % 3]);

  return (
    <div draggable onDragStart={e => drag.start(e, index)} onDragOver={e => drag.over(e, index)} onDrop={e => drag.drop(e, index)} onDragEnd={drag.end}
      style={{ border: `1px solid ${drag.dragIndex === index ? 'var(--sage)' : 'var(--gray-400)'}`, borderRadius: 'var(--radius-md)', padding: 14, background: drag.overIndex === index ? 'rgba(159,178,161,0.10)' : 'var(--white)', opacity: drag.dragIndex === index ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ cursor: 'grab', color: 'var(--gray-mid)', display: 'inline-flex' }} title="Ziehen zum Sortieren"><Icon name="grip" size={18} /></span>
        <div style={{ flex: 1 }}><TextInput value={item.name} placeholder="Name der Leistung" onChange={e => set('name', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconAction icon="copy" label="Duplizieren" onClick={() => onDuplicate(index)} />
          <IconAction icon="layers" label="Als Vorlage speichern" onClick={() => onSaveTemplate(item)} />
          <IconAction icon="trash" label="Entfernen" tone="danger" onClick={() => onDelete(index)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, marginBottom: 12 }}>
        <Field label="Menge"><TextInput type="number" min="1" value={item.quantity} onChange={e => set('quantity', Number(e.target.value))} /></Field>
        <Field label="Kategorie"><TextInput value={item.category} placeholder="z. B. Montage" onChange={e => set('category', e.target.value)} /></Field>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={cycleVisibility} type="button" style={{ padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gray-500)', background: 'var(--gray-300)', fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', cursor: 'pointer' }}>
          Sichtbarkeit: {VISIBILITY_LABEL[item.visibility]}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--charcoal)', cursor: 'pointer' }}>
          <input type="checkbox" checked={item.taxRelevantForCraftsmanWork} onChange={e => set('taxRelevantForCraftsmanWork', e.target.checked)} style={{ accentColor: 'var(--sage)' }} />
          Nachweis nach §35a EStG
        </label>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 6 }}>Beschreibungszeilen</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {item.descriptionLines.map((ln, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'var(--sage)', flex: 'none' }}>•</span>
            <div style={{ flex: 1 }}><TextInput value={ln} placeholder="Beschreibung…" onChange={e => setLine(i, e.target.value)} /></div>
            <IconAction icon="x" label="Zeile entfernen" onClick={() => delLine(i)} />
          </div>
        ))}
      </div>
      <button onClick={addLine} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--sage)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}><Icon name="plus" size={14} />Zeile hinzufügen</button>
    </div>
  );
}
