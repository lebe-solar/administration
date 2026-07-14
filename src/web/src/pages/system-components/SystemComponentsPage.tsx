import { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SystemComponentFormModal } from './SystemComponentFormModal';
import { useLayout } from '../../lib/layoutContext';
import { useToast } from '../../lib/ToastContext';
import { systemComponentsApi } from '../../api/systemComponents';
import { euro } from '../../lib/utils';
import type { SystemComponent } from '../../types';
import { ApiError } from '../../api/client';

const VISIBILITY_LABEL: Record<string, string> = { public: 'öffentlich', internal: 'intern', hidden: 'verborgen' };

export default function SystemComponentsPage() {
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; data?: SystemComponent } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SystemComponent | null>(null);

  function load() {
    setLoading(true);
    systemComponentsApi.list().then(setComponents)
      .catch(e => pushToast('error', e instanceof ApiError ? e.message : 'Systemkomponenten konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [pushToast]);

  async function handleSave(rec: Partial<SystemComponent>, editing: boolean) {
    if (editing && formState?.data) await systemComponentsApi.update(formState.data.id, rec);
    else await systemComponentsApi.create(rec);
    pushToast('success', editing ? 'Systemkomponente aktualisiert' : 'Systemkomponente erstellt');
    setFormState(null);
    load();
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await systemComponentsApi.remove(deleteTarget.id);
      pushToast('success', 'Systemkomponente gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
    }
  }

  return (
    <div>
      <Topbar title="Systemkomponenten" subtitle="Technische Komponenten und Zubehör — unabhängig von Hauptprodukten und Leistungen." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Neue Systemkomponente</AdminButton>} />

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>{[0, 1, 2].map(i => <div key={i} style={{ padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}><div style={{ height: 12, width: '30%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></div>)}</div>
        ) : components.length === 0 ? (
          <EmptyState icon="layers" title="Noch keine Systemkomponenten" text="Legen Sie Ihre erste Systemkomponente an, um sie in Angeboten verwenden zu können."
            action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Neue Systemkomponente</AdminButton>} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', textAlign: 'left', color: 'var(--gray-mid)' }}>
                  {['ID', 'Name', 'Kategorie', 'Einheit', 'Interner Preis', 'Sichtbarkeit', 'Status', ''].map((h, i) => <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {components.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < components.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--sage)', whiteSpace: 'nowrap', fontSize: 12.5 }}>{c.id}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--charcoal)' }}>{c.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gray-mid)' }}>{c.category || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>{c.unit}</td>
                    <td style={{ padding: '11px 14px' }}>{euro(c.internalPrice)}</td>
                    <td style={{ padding: '11px 14px' }}>{VISIBILITY_LABEL[c.visibility]}</td>
                    <td style={{ padding: '11px 14px' }}>{c.included ? 'inklusive' : 'optional'}</td>
                    <td style={{ padding: '11px 8px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <IconAction icon="edit" label="Bearbeiten" onClick={() => setFormState({ mode: 'edit', data: c })} />
                        <IconAction icon="trash" label="Löschen" tone="danger" onClick={() => setDeleteTarget(c)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {formState && <SystemComponentFormModal initial={formState.mode === 'edit' ? formState.data ?? null : null} onSave={handleSave} onClose={() => setFormState(null)} />}

      <ConfirmModal open={!!deleteTarget} title="Systemkomponente löschen?"
        description={deleteTarget ? `„${deleteTarget.name}" wird entfernt. Bereits gespeicherte Angebote bleiben unverändert.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
