import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Field, TextInput } from '../../components/ui/Fields';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ApiError } from '../../api/client';
import type { OfferItem } from '../../types';

export function ComponentFormModal({ initial, onSave, onClose }: {
  initial: OfferItem | null;
  onSave: (rec: Partial<OfferItem>, editing: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name || '', quantity: initial?.quantity ?? 1, price: initial?.price ?? 0,
    descriptionLines: initial?.descriptionLines?.length ? initial.descriptionLines : [''],
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(s => ({ ...s, [k]: v }));
  const setLine = (i: number, v: string) => { const l = [...f.descriptionLines]; l[i] = v; set('descriptionLines', l); };

  async function submit() {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Name erforderlich';
    if (!f.descriptionLines.some(l => l.trim())) e.descriptionLines = 'Mindestens eine Beschreibungszeile';
    setErr(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await onSave({ ...f, descriptionLines: f.descriptionLines.filter(l => l.trim()) }, !!initial);
    } catch (ex) {
      if (ex instanceof ApiError && ex.errors) setErr(ex.errors);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} width={560}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{initial ? 'Leistungsposition bearbeiten' : 'Neue Leistungsposition'}</h2>
        <IconAction icon="x" label="Schließen" onClick={onClose} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Name" required error={err.name}><TextInput value={f.name} error={err.name} onChange={e => set('name', e.target.value)} placeholder="z. B. Modulaufständerung" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Standardmenge"><TextInput type="number" min="1" value={f.quantity} onChange={e => set('quantity', Number(e.target.value))} /></Field>
          <Field label="Standardpreis (€)"><TextInput type="number" min="0" value={f.price} onChange={e => set('price', Number(e.target.value))} /></Field>
        </div>
        <Field label="Beschreibungszeilen" required error={err.descriptionLines}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {f.descriptionLines.map((ln, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: 'var(--sage)' }}>•</span>
                <div style={{ flex: 1 }}><TextInput value={ln} onChange={e => setLine(i, e.target.value)} placeholder="Beschreibung…" /></div>
                <IconAction icon="x" label="Entfernen" onClick={() => set('descriptionLines', f.descriptionLines.filter((_, x) => x !== i))} />
              </div>
            ))}
            <button onClick={() => set('descriptionLines', [...f.descriptionLines, ''])} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--sage)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', gap: 5, alignItems: 'center', padding: 0 }}><Icon name="plus" size={14} />Zeile hinzufügen</button>
          </div>
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <AdminButton variant="ghost" onClick={onClose}>Abbrechen</AdminButton>
        <AdminButton variant="primary" icon="check" disabled={saving} onClick={submit}>{initial ? 'Speichern' : 'Erstellen'}</AdminButton>
      </div>
    </Modal>
  );
}
