import { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ServiceFormModal } from './ServiceFormModal';
import { useLayout } from '../../lib/layoutContext';
import { useToast } from '../../lib/ToastContext';
import { servicesApi } from '../../api/services';
import type { Service } from '../../types';
import { ApiError } from '../../api/client';

const VISIBILITY_LABEL: Record<string, string> = { public: 'öffentlich', internal: 'intern', hidden: 'verborgen' };

export default function ServicesPage() {
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; data?: Service } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  function load() {
    setLoading(true);
    servicesApi.list().then(setServices).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSave(rec: Partial<Service>, editing: boolean) {
    if (editing && formState?.data) await servicesApi.update(formState.data.id, rec);
    else await servicesApi.create(rec);
    pushToast('success', editing ? 'Leistungsposition aktualisiert' : 'Leistungsposition erstellt');
    setFormState(null);
    load();
  }
  async function duplicate(s: Service) {
    await servicesApi.duplicate(s.id);
    pushToast('success', 'Leistungsposition dupliziert');
    load();
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await servicesApi.remove(deleteTarget.id);
      pushToast('success', 'Leistungsposition gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
    }
  }

  return (
    <div>
      <Topbar title="Inklusivleistungen" subtitle="Wiederverwendbare Leistungspositionen für den Angebots-Builder." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Neue Leistungsposition erstellen</AdminButton>} />

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>{[0, 1, 2].map(i => <div key={i} style={{ padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}><div style={{ height: 12, width: '30%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></div>)}</div>
        ) : services.length === 0 ? (
          <EmptyState icon="check" title="Noch keine Leistungspositionen" text="Legen Sie Ihre erste wiederverwendbare Leistungsposition an."
            action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Neue Leistungsposition erstellen</AdminButton>} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', textAlign: 'left', color: 'var(--gray-mid)' }}>
                  {['ID', 'Name', 'Kategorie', 'Beschreibungszeilen', '§35a', 'Sichtbarkeit', ''].map((h, i) => <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {services.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < services.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--sage)', whiteSpace: 'nowrap', fontSize: 12.5 }}>{c.id}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--charcoal)' }}>{c.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--gray-mid)' }}>{c.category || '—'}</td>
                    <td style={{ padding: '11px 14px', maxWidth: 420, color: 'var(--gray-mid)' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, lineHeight: 1.4 }}>{c.descriptionLines.join(' · ')}</div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>{c.taxRelevantForCraftsmanWork ? 'ja' : '—'}</td>
                    <td style={{ padding: '11px 14px' }}>{VISIBILITY_LABEL[c.visibility]}</td>
                    <td style={{ padding: '11px 8px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <IconAction icon="edit" label="Bearbeiten" onClick={() => setFormState({ mode: 'edit', data: c })} />
                        <IconAction icon="copy" label="Duplizieren" onClick={() => duplicate(c)} />
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

      {formState && <ServiceFormModal initial={formState.mode === 'edit' ? formState.data ?? null : null} onSave={handleSave} onClose={() => setFormState(null)} />}

      <ConfirmModal open={!!deleteTarget} title="Leistungsposition löschen?"
        description={deleteTarget ? `„${deleteTarget.name}" wird aus den Vorlagen entfernt. Bereits gespeicherte Angebote bleiben unverändert.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
