import { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ComponentFormModal } from './ComponentFormModal';
import { useLayout } from '../../lib/layoutContext';
import { useToast } from '../../lib/ToastContext';
import { offerComponentsApi } from '../../api/offers';
import { euro } from '../../lib/utils';
import type { OfferItem } from '../../types';
import { ApiError } from '../../api/client';

export default function OfferComponentsPage() {
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();
  const [components, setComponents] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; data?: OfferItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferItem | null>(null);

  function load() {
    setLoading(true);
    offerComponentsApi.list().then(setComponents).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSave(rec: Partial<OfferItem>, editing: boolean) {
    if (editing && formState?.data) await offerComponentsApi.update(formState.data.id, rec);
    else await offerComponentsApi.create(rec);
    pushToast('success', editing ? 'Leistungsposition aktualisiert' : 'Leistungsposition erstellt');
    setFormState(null);
    load();
  }
  async function duplicate(c: OfferItem) {
    await offerComponentsApi.duplicate(c.id);
    pushToast('success', 'Leistungsposition dupliziert');
    load();
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await offerComponentsApi.remove(deleteTarget.id);
      pushToast('success', 'Leistungsposition gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
    }
  }

  return (
    <div>
      <Topbar title="Leistungspositionen" subtitle="Wiederverwendbare Inklusivleistungen für den Angebots-Builder." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Neue Leistungsposition erstellen</AdminButton>} />

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}>
                <div style={{ height: 12, width: '30%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', textAlign: 'left', color: 'var(--gray-mid)' }}>
                  {['ID', 'Name', 'Menge', 'Preis', 'Beschreibungszeilen', 'Aktualisiert', ''].map((h, i) => <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {components.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < components.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--sage)', whiteSpace: 'nowrap', fontSize: 12.5 }}>{c.id}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--charcoal)' }}>{c.name}</td>
                    <td style={{ padding: '11px 14px' }}>{c.quantity}</td>
                    <td style={{ padding: '11px 14px' }}>{c.price ? euro(c.price) : 'inkl.'}</td>
                    <td style={{ padding: '11px 14px', maxWidth: 420, color: 'var(--gray-mid)' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, lineHeight: 1.4 }}>{c.descriptionLines.join(' · ')}</div>
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--gray-mid)', fontSize: 12.5, whiteSpace: 'nowrap' }}>{c.updatedAt || '—'}</td>
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

      {formState && (
        <ComponentFormModal initial={formState.mode === 'edit' ? formState.data ?? null : null} onSave={handleSave} onClose={() => setFormState(null)} />
      )}

      <ConfirmModal open={!!deleteTarget} title="Leistungsposition löschen?"
        description={deleteTarget ? `„${deleteTarget.name}" wird aus den Vorlagen entfernt. Bereits gespeicherte Angebote bleiben unverändert.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
