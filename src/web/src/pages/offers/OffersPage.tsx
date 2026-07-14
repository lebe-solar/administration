import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { TextInput, SelectInput } from '../../components/ui/Fields';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AngebotCard } from './AngebotCard';
import { computeSystem, displayPrice } from './offerUtils';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, isExpired } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import type { Offer, Product } from '../../types';
import { ApiError } from '../../api/client';

export default function OffersPage() {
  const { mobile, onMenu } = useLayout();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [st, setSt] = useState('all');
  const [price, setPrice] = useState('all');
  const [valid, setValid] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  function load() {
    setLoading(true);
    Promise.all([offersApi.list(), productsApi.list()])
      .then(([o, p]) => { setOffers(o); setProducts(p); })
      .catch(e => pushToast('error', e instanceof ApiError ? e.message : 'Angebote konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [pushToast]);

  const productsById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);

  const filtered = offers.filter(o =>
    (st === 'all' || o.status === st) &&
    (price === 'all' || (price === 'lt15' ? (o.priceAmount || 0) < 15000 : price === '15to30' ? (o.priceAmount || 0) >= 15000 && (o.priceAmount || 0) <= 30000 : (o.priceAmount || 0) > 30000)) &&
    (valid === 'all' || (valid === 'active' ? !isExpired(o.validUntil) : isExpired(o.validUntil))) &&
    (q === '' || (o.title + ' ' + o.id + ' ' + o.subtitle).toLowerCase().includes(q.toLowerCase()))
  );

  async function duplicate(o: Offer) {
    try {
      await offersApi.duplicate(o.id);
      pushToast('success', 'Angebot dupliziert');
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Duplizieren fehlgeschlagen');
    }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await offersApi.remove(deleteTarget.id);
      pushToast('success', 'Angebot gelöscht');
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Löschen fehlgeschlagen');
    }
  }

  const gridCols = w < 700 ? '1fr' : w < 1200 ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <div>
      <Topbar title="Angebote verwalten" subtitle="Erstellen und verwalten Sie Angebotspakete für die LeBe-Solarenergie Webseite." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => navigate('/offers/new')}>Neues Angebot erstellen</AdminButton>} />

      <Card pad={16} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-mid)' }}><Icon name="search" size={17} /></span>
            <TextInput placeholder="Suche nach Titel oder ID…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ minWidth: 130, flex: '0 1 160px' }}>
            <SelectInput value={st} onChange={e => setSt(e.target.value)}>
              <option value="all">Alle Status</option><option value="Active">Active</option><option value="Draft">Draft</option><option value="Hidden">Hidden</option>
            </SelectInput>
          </div>
          <div style={{ minWidth: 140, flex: '0 1 180px' }}>
            <SelectInput value={price} onChange={e => setPrice(e.target.value)}>
              <option value="all">Alle Preise</option><option value="lt15">unter 15.000 €</option><option value="15to30">15.000 – 30.000 €</option><option value="gt30">über 30.000 €</option>
            </SelectInput>
          </div>
          <div style={{ minWidth: 130, flex: '0 1 160px' }}>
            <SelectInput value={valid} onChange={e => setValid(e.target.value)}>
              <option value="all">Gültigkeit: alle</option><option value="active">gültig</option><option value="expired">abgelaufen</option>
            </SelectInput>
          </div>
        </div>
      </Card>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 18 }}>
          {[0, 1, 2].map(i => <Card key={i} pad={0} style={{ height: 380, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card pad={0}>
          <EmptyState icon={offers.length === 0 ? 'tag' : 'search'}
            title={offers.length === 0 ? 'Noch keine Angebote' : 'Keine Treffer'}
            text={offers.length === 0 ? 'Erstellen Sie Ihr erstes Angebotspaket für die Website.' : 'Keine Angebote entsprechen Ihren Filtern.'}
            action={offers.length === 0 ? <AdminButton icon="plus" onClick={() => navigate('/offers/new')}>Neues Angebot erstellen</AdminButton> : <AdminButton variant="outline" onClick={() => { setQ(''); setSt('all'); setPrice('all'); setValid('all'); }}>Filter zurücksetzen</AdminButton>} />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 18 }}>
          {filtered.map(o => (
            <AngebotCard key={o.id} offer={o} calculatedSystem={o.calculatedSystem || computeSystem(o.mainProducts, productsById)} productsById={productsById}
              price={displayPrice(o)}
              actions={([
                ['eye', 'Vorschau', () => navigate(`/offers/${o.id}/preview`)],
                ['edit', 'Bearbeiten', () => navigate(`/offers/${o.id}/edit`)],
                ['copy', 'Duplizieren', () => duplicate(o)],
                ['trash', 'Löschen', () => setDeleteTarget(o)],
              ] as const).map(([ic, lb, fn], i) => (
                <button key={ic} onClick={fn} title={lb} style={{ flex: 1, padding: '10px 0', border: 'none', borderLeft: i ? '1px solid var(--gray-300)' : 'none', background: 'var(--white)', color: ic === 'trash' ? '#c0392b' : 'var(--charcoal)', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-300)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}>
                  <Icon name={ic} size={16} />
                </button>
              ))} />
          ))}
        </div>
      )}
      {!loading && filtered.length > 0 && <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--gray-mid)' }}>{filtered.length} von {offers.length} Angeboten</p>}

      <ConfirmModal open={!!deleteTarget} title="Angebot löschen?"
        description={deleteTarget ? `„${deleteTarget.title}" (${deleteTarget.id}) wird dauerhaft entfernt.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
