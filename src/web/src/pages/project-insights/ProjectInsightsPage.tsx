import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Tag } from '../../components/ui/Tag';
import { StatusBadge } from '../../components/ui/Badges';
import { TextInput, SelectInput } from '../../components/ui/Fields';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useLayout } from '../../lib/layoutContext';
import { useToast } from '../../lib/ToastContext';
import { projectInsightsApi } from '../../api/projectInsights';
import type { ProjectInsight } from '../../types';
import { ApiError } from '../../api/client';

export default function ProjectInsightsPage() {
  const { mobile, onMenu } = useLayout();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [rows, setRows] = useState<ProjectInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [buildingType, setBuildingType] = useState('all');
  const [customerType, setCustomerType] = useState('all');
  const [previewing, setPreviewing] = useState<ProjectInsight | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectInsight | null>(null);

  function load() {
    setLoading(true);
    projectInsightsApi.list().then(setRows).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = rows.filter(p =>
    (status === 'all' || p.status === status) &&
    (buildingType === 'all' || p.buildingType === buildingType) &&
    (customerType === 'all' || p.customerType === customerType) &&
    (q === '' || (p.title + ' ' + p.locationLabel + ' ' + p.id).toLowerCase().includes(q.toLowerCase()))
  );

  async function duplicate(p: ProjectInsight) {
    await projectInsightsApi.duplicate(p.id);
    pushToast('success', 'Projekt dupliziert');
    load();
  }
  async function archive(p: ProjectInsight) {
    await projectInsightsApi.archive(p.id);
    pushToast('success', 'Projekt archiviert');
    load();
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await projectInsightsApi.remove(deleteTarget.id);
      pushToast('success', 'Projekt gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
    }
  }

  const buildingTypes = Array.from(new Set(rows.map(r => r.buildingType)));

  return (
    <div>
      <Topbar title="Projekt-Einblicke" subtitle="Verwalten Sie Referenzen und Projektbeispiele für Landing Page, Über uns und weitere Website-Bereiche." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => navigate('/project-insights/new')}>Projekt erstellen</AdminButton>} />

      <Card pad={16} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-mid)' }}><Icon name="search" size={17} /></span>
            <TextInput placeholder="Projekt suchen…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ minWidth: 130, flex: '0 1 160px' }}>
            <SelectInput value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">Alle Status</option><option value="Entwurf">Entwurf</option><option value="Veröffentlicht">Veröffentlicht</option><option value="Archiviert">Archiviert</option>
            </SelectInput>
          </div>
          <div style={{ minWidth: 150, flex: '0 1 180px' }}>
            <SelectInput value={buildingType} onChange={e => setBuildingType(e.target.value)}>
              <option value="all">Alle Gebäudetypen</option>
              {buildingTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </SelectInput>
          </div>
          <div style={{ minWidth: 140, flex: '0 1 170px' }}>
            <SelectInput value={customerType} onChange={e => setCustomerType(e.target.value)}>
              <option value="all">Gewerbe / Privat: alle</option><option value="Privatkunde">Privatkunde</option><option value="Gewerbekunde">Gewerbekunde</option>
            </SelectInput>
          </div>
        </div>
      </Card>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>{[0, 1, 2].map(i => <div key={i} style={{ padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}><div style={{ height: 12, width: '30%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></div>)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={rows.length === 0 ? 'image' : 'search'}
            title={rows.length === 0 ? 'Noch keine Projekt-Einblicke' : 'Keine Treffer'}
            text={rows.length === 0 ? 'Erstellen Sie Ihr erstes Projektbeispiel.' : 'Keine Projekte entsprechen Ihren Filtern.'}
            action={rows.length === 0 ? <AdminButton icon="plus" onClick={() => navigate('/project-insights/new')}>Projekt erstellen</AdminButton> : <AdminButton variant="outline" onClick={() => { setQ(''); setStatus('all'); setBuildingType('all'); setCustomerType('all'); }}>Filter zurücksetzen</AdminButton>} />
        ) : (
          <div>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                <div style={{ width: 64, height: 48, borderRadius: 8, background: 'var(--sage)', flex: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.mainImage ? <img src={p.mainImage} alt={p.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size={18} color="rgba(255,255,255,0.75)" />}
                </div>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{p.locationLabel} · {p.buildingType}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: '1 1 200px' }}>
                  {p.badges.slice(0, 3).map(b => <Tag key={b.id}>{b.label}</Tag>)}
                </div>
                <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <StatusBadge status={p.status === 'Veröffentlicht' ? 'Active' : p.status === 'Archiviert' ? 'Hidden' : 'Draft'} />
                  <span style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{p.visibility.landingPage ? 'Landing' : ''}{p.visibility.landingPage && p.visibility.aboutPage ? ' · ' : ''}{p.visibility.aboutPage ? 'Über uns' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, flex: 'none' }}>
                  <IconAction icon="eye" label="Vorschau" onClick={() => setPreviewing(p)} />
                  <IconAction icon="edit" label="Bearbeiten" onClick={() => navigate(`/project-insights/${p.id}/edit`)} />
                  <IconAction icon="copy" label="Duplizieren" onClick={() => duplicate(p)} />
                  <IconAction icon="archive" label="Archivieren" onClick={() => archive(p)} />
                  <IconAction icon="trash" label="Löschen" tone="danger" onClick={() => setDeleteTarget(p)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {!loading && filtered.length > 0 && <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--gray-mid)' }}>{filtered.length} von {rows.length} Projekten</p>}

      {previewing && (
        <div onClick={() => setPreviewing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(60,60,59,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 380, width: '100%' }}>
            <div style={{ height: 180, background: 'var(--sage)' }}>
              {previewing.mainImage ? <img src={previewing.mainImage} alt={previewing.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 11.5, color: 'var(--sage)', fontWeight: 700, marginBottom: 4 }}>Projekt-Einblick · {previewing.locationLabel}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>{previewing.title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>{previewing.badges.filter(b => b.visible).map(b => <Tag key={b.id}>{b.label}</Tag>)}</div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{previewing.shortDescription}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Projekt löschen?"
        description={deleteTarget ? `„${deleteTarget.title}" wird dauerhaft entfernt.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
