import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Field, TextInput, TextArea } from '../../components/ui/Fields';
import { LogoUpload } from '../../components/ui/LogoUpload';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ApiError } from '../../api/client';
import type { Manufacturer } from '../../types';

export function ManufacturerFormModal({ initial, onSave, onClose }: {
  initial: Manufacturer | null;
  onSave: (rec: Partial<Manufacturer>, editing: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [f, setF] = useState({ name: initial?.name || '', description: initial?.description || '', logo: initial?.logo || null as string | null, link: initial?.link || '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(s => ({ ...s, [k]: v }));

  async function submit() {
    if (!f.name.trim()) { setErrors({ name: 'Name ist erforderlich' }); return; }
    setSaving(true);
    try {
      await onSave(f, !!initial);
    } catch (e) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      else setErrors({ name: e instanceof Error ? e.message : 'Speichern fehlgeschlagen' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} width={520}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: 'var(--charcoal)' }}>{initial ? 'Hersteller bearbeiten' : 'Hersteller hinzufügen'}</h2>
        <IconAction icon="x" label="Schließen" onClick={onClose} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Manufacturer name" required error={errors.name}>
          <TextInput value={f.name} error={errors.name} onChange={e => set('name', e.target.value)} placeholder="z. B. Solarfabrik" />
        </Field>
        <Field label="Description">
          <TextArea value={f.description} onChange={e => set('description', e.target.value)} placeholder="Kurzbeschreibung des Herstellers…" />
        </Field>
        <Field label="Logo image" hint="PNG, JPG, SVG oder WEBP">
          <LogoUpload value={f.logo} name={f.name} onChange={v => set('logo', v)} />
        </Field>
        <Field label="Website link">
          <TextInput value={f.link} onChange={e => set('link', e.target.value)} placeholder="https://…" />
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <AdminButton variant="ghost" onClick={onClose}>Cancel</AdminButton>
        <AdminButton variant="primary" icon="check" disabled={saving} onClick={submit}>{initial ? 'Save' : 'Add Manufacturer'}</AdminButton>
      </div>
    </Modal>
  );
}
