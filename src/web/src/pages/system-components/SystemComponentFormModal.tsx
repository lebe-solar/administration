import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ApiError } from '../../api/client';
import type { SystemComponent, Visibility } from '../../types';

export function SystemComponentFormModal({ initial, onSave, onClose }: {
  initial: SystemComponent | null;
  onSave: (rec: Partial<SystemComponent>, editing: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name || '', category: initial?.category || '', unit: initial?.unit || 'Stück',
    internalPrice: initial?.internalPrice ?? 0, publicLabel: initial?.publicLabel || '', publicDescription: initial?.publicDescription || '',
    visibility: (initial?.visibility || 'public') as Visibility, included: initial?.included ?? true, optional: initial?.optional ?? false,
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(s => ({ ...s, [k]: v }));

  async function submit() {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Name erforderlich';
    setErr(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await onSave(f, !!initial);
    } catch (ex) {
      if (ex instanceof ApiError && ex.errors) setErr(ex.errors);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} width={560}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{initial ? 'Systemkomponente bearbeiten' : 'Neue Systemkomponente'}</h2>
        <IconAction icon="x" label="Schließen" onClick={onClose} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Name" required error={err.name}><TextInput value={f.name} error={err.name} onChange={e => set('name', e.target.value)} placeholder="z. B. Smart Meter" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Kategorie"><TextInput value={f.category} onChange={e => set('category', e.target.value)} placeholder="z. B. Messtechnik" /></Field>
          <Field label="Einheit"><TextInput value={f.unit} onChange={e => set('unit', e.target.value)} placeholder="Stück" /></Field>
        </div>
        <Field label="Interner Preis (€)"><TextInput type="number" min="0" value={f.internalPrice} onChange={e => set('internalPrice', Number(e.target.value))} /></Field>
        <Field label="Öffentliches Label" hint="Wird auf der Angebotsseite gezeigt, falls sichtbar"><TextInput value={f.publicLabel} onChange={e => set('publicLabel', e.target.value)} /></Field>
        <Field label="Öffentliche Beschreibung"><TextArea value={f.publicDescription} onChange={e => set('publicDescription', e.target.value)} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Sichtbarkeit">
            <SelectInput value={f.visibility} onChange={e => set('visibility', e.target.value as Visibility)}>
              <option value="public">öffentlich</option>
              <option value="internal">intern</option>
              <option value="hidden">verborgen</option>
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput value={f.included ? 'included' : 'optional'} onChange={e => { const included = e.target.value === 'included'; setF(s => ({ ...s, included, optional: !included })); }}>
              <option value="included">inklusive</option>
              <option value="optional">optional</option>
            </SelectInput>
          </Field>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <AdminButton variant="ghost" onClick={onClose}>Abbrechen</AdminButton>
        <AdminButton variant="primary" icon="check" disabled={saving} onClick={submit}>{initial ? 'Speichern' : 'Erstellen'}</AdminButton>
      </div>
    </Modal>
  );
}
