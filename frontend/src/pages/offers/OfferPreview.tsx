import { Icon } from '../../components/ui/Icon';
import { LogoThumb } from '../../components/ui/LogoThumb';
import { AllowBadge } from '../../components/ui/Badges';
import { useWindowWidth, fmtDate, euro } from '../../lib/utils';
import { SLOTS } from './offerUtils';
import type { Offer, Product } from '../../types';

export function OfferPreview({ offer, products }: { offer: Offer; products: Product[] }) {
  const w = useWindowWidth();
  const selected = SLOTS.map(s => {
    const id = offer.products[(s.key + 'Id') as keyof typeof offer.products];
    if (!id) return null;
    const p = products.find(x => x.id === id);
    return p ? { slot: s, product: p, count: (offer.products[(s.key + 'Count') as keyof typeof offer.products] as number) || 1 } : null;
  }).filter((v): v is { slot: typeof SLOTS[number]; product: Product; count: number } => !!v);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-raised)' }}>
        <div style={{ position: 'relative', height: w < 700 ? 200 : 300, background: 'var(--sage)' }}>
          {offer.previewImage
            ? <img src={offer.previewImage} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}><Icon name="image" size={40} /></div>}
          <div style={{ position: 'absolute', top: 14, left: 14 }}><AllowBadge allow={offer.allowChanges} /></div>
        </div>
        <div style={{ padding: w < 700 ? '24px 20px' : '36px 44px' }}>
          <h1 style={{ margin: 0, fontSize: w < 700 ? 26 : 36, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.12 }}>{offer.title || 'Angebotstitel'}</h1>
          <p style={{ margin: '10px 0 0', fontSize: w < 700 ? 16 : 20, color: 'var(--sage)', fontWeight: 600, lineHeight: 1.35 }}>{offer.subtitle}</p>
          {offer.designedFor && (
            <div style={{ marginTop: 18, display: 'inline-flex', gap: 8, alignItems: 'flex-start', background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
              <Icon name="check" size={17} color="var(--sage)" style={{ marginTop: 2 }} /><span style={{ fontSize: 14.5, color: 'var(--charcoal)' }}>{offer.designedFor}</span>
            </div>
          )}
          <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--charcoal)' }}>{offer.description}</p>
          {offer.system && <div style={{ marginTop: 16, fontSize: 14.5, color: 'var(--gray-mid)', display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="layers" size={16} />{offer.system}</div>}

          {selected.length > 0 && (
            <>
              <h3 style={{ margin: '30px 0 14px', fontSize: 19, fontWeight: 700 }}>Enthaltene Komponenten</h3>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : '1fr 1fr', gap: 12 }}>
                {selected.map(({ slot, product, count }) => (
                  <div key={slot.key} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                    <LogoThumb src={product.Logo} name={product.Hersteller} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--sage)', fontWeight: 700 }}>{slot.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.Header}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--gray-mid)' }}>{product.Hersteller} · {product.Power}{product.Unit ? ' ' + product.Unit : ''}</div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)' }}>×{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {offer.inclusive.length > 0 && (
            <>
              <h3 style={{ margin: '30px 0 14px', fontSize: 19, fontWeight: 700 }}>Inklusivleistungen</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offer.inclusive.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(31,138,91,0.14)', color: '#1f8a5b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: 2 }}><Icon name="check" size={15} /></span>
                    <div>
                      <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--charcoal)' }}>{s.name}{s.quantity > 1 ? ` (${s.quantity}×)` : ''}</div>
                      {s.descriptionLines.filter(l => l.trim()).map((l, j) => <div key={j} style={{ fontSize: 13.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {offer.conditions && <div style={{ marginTop: 26, padding: '14px 16px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--charcoal)', lineHeight: 1.5 }}><strong>Voraussetzungen:</strong> {offer.conditions}</div>}

          <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid var(--gray-400)', paddingTop: 24 }}>
            <div>
              <div style={{ fontSize: w < 700 ? 26 : 32, fontWeight: 700, color: 'var(--charcoal)' }}>{offer.priceLabel || (offer.priceAmount ? euro(Number(offer.priceAmount)) : offer.price || '—')}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 4, display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={13} />Gültig bis {fmtDate(offer.validUntil)}</div>
            </div>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--charcoal)', color: 'var(--yellow)', padding: '14px 28px', borderRadius: 'var(--radius-pill)', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>Angebot anfragen<Icon name="chevright" size={18} /></a>
          </div>
          {offer.link && <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--gray-mid)', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="globe" size={13} />{offer.link}</div>}
        </div>
      </div>
    </div>
  );
}
