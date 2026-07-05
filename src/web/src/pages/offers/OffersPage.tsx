import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { TextInput, SelectInput } from '../../components/ui/Fields';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { StatusBadge, AllowBadge } from '../../components/ui/Badges';
import { OfferPreview } from './OfferPreview';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, fmtDate, isExpired } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import { linkedProductCount } from './offerUtils';
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
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  function load() {
    setLoading(true);
    Promise.all([offersApi.list(), productsApi.list()])
      .then(([o, p]) => { setOffers(o); setProducts(p); })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = offers.filter(o =>
    (st === 'all' || o.status === st) &&
    (price === 'all' || (price === 'lt15' ? (o.priceAmount || 0) < 15000 : price === '15to30' ? (o.priceAmount || 0) >= 15000 && (o.priceAmount || 0) <= 30000 : (o.priceAmount || 0) > 30000)) &&
    (valid === 'all' || (valid === 'active' ? !isExpired(o.validUntil) : isExpired(o.validUntil))) &&
    (q === '' || (o.title + ' ' + o.id + ' ' + o.subtitle).toLowerCase().includes(q.toLowerCase()))
  );

  async function duplicate(o: Offer) {
    await offersApi.duplicate(o.id);
    pushToast('success', 'Angebot dupliziert');
    load();
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
          {[0, 1, 2].map(i => <Card key={i} pad={0} style={{ height: 320, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />)}
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
            <Card key={o.id} pad={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 150, background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {o.previewImage
                  ? <img src={o.previewImage} alt={o.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Icon name="image" size={34} color="rgba(255,255,255,0.7)" />}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  <StatusBadge status={o.status} />{isExpired(o.validUntil) && <span style={{ padding: '4px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(192,57,43,0.9)', color: '#fff', fontSize: 11, fontWeight: 600 }}>Abgelaufen</span>}
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 10 }}><AllowBadge allow={o.allowChanges} /></div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 700 }}>{o.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.25 }}>{o.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.subtitle}</div>
                <div style={{ fontSize: 12.5, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="layers" size={13} color="var(--gray-mid)" />{o.system}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--gray-mid)', marginTop: 2 }}>
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="box" size={12} />{linkedProductCount(o.products)} Produkte</span>
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="check" size={12} />{o.inclusive.length} Leistungen</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>{o.priceLabel || o.price}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>bis {fmtDate(o.validUntil)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: '1px solid var(--gray-300)' }}>
                {([
                  ['eye', 'Vorschau', () => setPreviewOffer(o)],
                  ['edit', 'Bearbeiten', () => navigate(`/offers/${o.id}/edit`)],
                  ['copy', 'Duplizieren', () => duplicate(o)],
                  ['trash', 'Löschen', () => setDeleteTarget(o)],
                ] as const).map(([ic, lb, fn], i) => (
                  <button key={ic} onClick={fn} title={lb} style={{ flex: 1, padding: '10px 0', border: 'none', borderLeft: i ? '1px solid var(--gray-300)' : 'none', background: 'var(--white)', color: ic === 'trash' ? '#c0392b' : 'var(--charcoal)', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-300)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}>
                    <Icon name={ic} size={16} />
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading && filtered.length > 0 && <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--gray-mid)' }}>{filtered.length} von {offers.length} Angeboten</p>}

      {previewOffer && (
        <div onClick={() => setPreviewOffer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(60,60,59,0.6)', zIndex: 200, overflow: 'auto', padding: '30px 16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--white)', fontSize: 14, fontWeight: 600 }}><Icon name="globe" size={16} />Öffentliche Vorschau · {previewOffer.id}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <AdminButton variant="accent" icon="edit" onClick={() => { const o = previewOffer; setPreviewOffer(null); navigate(`/offers/${o.id}/edit`); }}>Bearbeiten</AdminButton>
                <AdminButton variant="primary" icon="x" onClick={() => setPreviewOffer(null)}>Schließen</AdminButton>
              </div>
            </div>
            <OfferPreview offer={previewOffer} products={products} />
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Angebot löschen?"
        description={deleteTarget ? `„${deleteTarget.title}" (${deleteTarget.id}) wird dauerhaft entfernt.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
