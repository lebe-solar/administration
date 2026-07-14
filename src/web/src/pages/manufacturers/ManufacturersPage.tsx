import { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { LogoThumb } from '../../components/ui/LogoThumb';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ManufacturerFormModal } from './ManufacturerFormModal';
import { useLayout } from '../../lib/layoutContext';
import { useToast } from '../../lib/ToastContext';
import { manufacturersApi } from '../../api/manufacturers';
import { ApiError } from '../../api/client';
import type { Manufacturer } from '../../types';

export default function ManufacturersPage() {
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; data?: Manufacturer } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Manufacturer | null>(null);

  function load() {
    setLoading(true);
    manufacturersApi.list().then(setManufacturers)
      .catch(e => pushToast('error', e instanceof ApiError ? e.message : 'Hersteller konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [pushToast]);

  async function handleSave(rec: Partial<Manufacturer>, editing: boolean) {
    if (editing && formState?.data) await manufacturersApi.update(formState.data.id, rec);
    else await manufacturersApi.create(rec);
    pushToast('success', editing ? 'Hersteller aktualisiert' : 'Hersteller hinzugefügt');
    setFormState(null);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await manufacturersApi.remove(deleteTarget.id);
      pushToast('success', 'Hersteller gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
      setDeleteTarget(null);
    }
  }

  function onDeleteClick(m: Manufacturer) {
    if ((m.linkedProducts || 0) > 0) {
      pushToast('error', `„${m.name}" hat ${m.linkedProducts} verknüpfte Produkte`);
    } else {
      setDeleteTarget(m);
    }
  }

  return (
    <div>
      <Topbar title="Manufacturers" subtitle="Hersteller verwalten und Logos pflegen." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => setFormState({ mode: 'add' })}>Add Manufacturer</AdminButton>} />

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gray-400)', animation: 'admpulse 1.2s infinite' }} />
                <div style={{ flex: 1 }}><div style={{ height: 12, width: '30%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', textAlign: 'left', color: 'var(--gray-mid)' }}>
                  {['ID', 'Logo', 'Name', 'Description', 'Website', 'Products', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {manufacturers.map((m, i) => {
                  const n = m.linkedProducts || 0;
                  return (
                    <tr key={m.id} style={{ borderBottom: i < manufacturers.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--sage)' }}>#{m.id}</td>
                      <td style={{ padding: '11px 14px' }}><LogoThumb src={m.logo} name={m.name} size={36} /></td>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{m.name}</td>
                      <td style={{ padding: '11px 14px', maxWidth: 360, color: 'var(--gray-mid)' }}>
                        <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, lineHeight: 1.4 }}>{m.description}</div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <a href={m.link} target="_blank" rel="noreferrer" style={{ color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}><Icon name="external" size={14} />Link</a>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-flex', minWidth: 26, justifyContent: 'center', padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: n ? 'rgba(159,178,161,0.22)' : 'var(--gray-400)', color: 'var(--charcoal)', fontWeight: 600, fontSize: 12.5 }}>{n}</span>
                      </td>
                      <td style={{ padding: '11px 8px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <IconAction icon="edit" label="Bearbeiten" onClick={() => setFormState({ mode: 'edit', data: m })} />
                          <IconAction icon="trash" label={n ? 'Verknüpft — nicht löschbar' : 'Löschen'} tone="danger" onClick={() => onDeleteClick(m)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {formState && (
        <ManufacturerFormModal initial={formState.mode === 'edit' ? formState.data ?? null : null}
          onSave={handleSave} onClose={() => setFormState(null)} />
      )}

      <ConfirmModal open={!!deleteTarget} title="Hersteller löschen?"
        description={deleteTarget ? `„${deleteTarget.name}" wird entfernt. Keine Produkte sind verknüpft.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
