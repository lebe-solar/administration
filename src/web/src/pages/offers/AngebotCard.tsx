import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { LogoThumb } from '../../components/ui/LogoThumb';
import { StatusBadge } from '../../components/ui/Badges';
import { fmtDate, isExpired } from '../../lib/utils';
import { mainComponentsList } from './offerUtils';
import type { CalculatedSystem, Offer, Product } from '../../types';

type AngebotCardOffer = Pick<Offer, 'id' | 'title' | 'subtitle' | 'status' | 'validUntil' | 'previewImageUrl' | 'mainProducts' | 'includedServices'>;

// The public-style offer card, shared between the Angebote grid and the builder's
// "Vorschau & Veröffentlichung" step preview so both stay visually identical.
export function AngebotCard({ offer, calculatedSystem, productsById, price, actions }: {
  offer: AngebotCardOffer;
  calculatedSystem: CalculatedSystem;
  productsById: Record<string, Product>;
  price: string;
  actions?: ReactNode;
}) {
  const mainMini = mainComponentsList(offer, productsById);
  const publicServices = offer.includedServices.filter(s => s.visibility === 'public' && s.included).slice(0, 3);

  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 160, background: 'var(--sage)' }}>
        {offer.previewImageUrl
          ? <img src={offer.previewImageUrl} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={32} color="rgba(255,255,255,0.7)" /></div>}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <StatusBadge status={offer.status} />
          {isExpired(offer.validUntil) && <span style={{ padding: '4px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(192,57,43,0.9)', color: '#fff', fontSize: 11, fontWeight: 600 }}>Abgelaufen</span>}
        </div>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.25 }}>{offer.title}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.4, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{offer.subtitle}</div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {calculatedSystem.pvPowerKwp != null && <Chip>{calculatedSystem.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp</Chip>}
          {calculatedSystem.moduleCount > 0 && <Chip>{calculatedSystem.moduleCount} Module</Chip>}
          {calculatedSystem.storageCapacityKwh != null && <Chip>{calculatedSystem.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh Speicher</Chip>}
          {offer.mainProducts.wallbox && <Chip>Wallbox inklusive</Chip>}
        </div>

        {mainMini.length > 0 && (
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6 }}>Verbaut im Paket</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mainMini.map(({ slot, product, quantity }) => (
                <div key={slot.key} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gray-400)', borderRadius: 8, padding: '6px 8px' }}>
                  <LogoThumb src={product.Logo} name={product.Hersteller} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '.02em' }}>{slot.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.Header}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--charcoal)', background: 'var(--gray-300)', borderRadius: 'var(--radius-pill)', padding: '2px 7px' }}>×{quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {publicServices.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--gray-mid)', lineHeight: 1.6 }}>
            {publicServices.map(s => s.name).join(' · ')}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>{price}</span>
          <span style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>bis {fmtDate(offer.validUntil)}</span>
        </div>
      </div>

      {actions && <div style={{ display: 'flex', borderTop: '1px solid var(--gray-300)' }}>{actions}</div>}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: 11.5, fontWeight: 600 }}>{children}</span>;
}
