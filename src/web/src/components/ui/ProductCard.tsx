import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import type { Product } from '../../types';

// The unified product card used everywhere a real catalog product is shown to a
// customer-facing or near-customer-facing surface: the offer builder's Hauptprodukte
// step and the offer detail preview's Hauptkomponenten section. Per the design spec:
// logo badge top-right (no manufacturer name in the headline), yellow Leistung/Garantie
// badges, plain "Datenblatt (PDF)" link instead of a button.
export function ProductCard({ product, quantity, style }: { product: Product; quantity?: number; style?: CSSProperties }) {
  return (
    <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--white)', display: 'flex', flexDirection: 'column', ...style }}>
      <div style={{ position: 'relative', height: 150, background: 'var(--sage)' }}>
        {product.image
          ? <img src={product.image} alt={product.Header} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="panel" size={30} color="rgba(255,255,255,0.7)" /></div>}
        {product.Logo && (
          <span style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: 8, background: 'var(--white)', border: '1px solid var(--gray-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <img src={product.Logo} alt={product.Hersteller} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </span>
        )}
        {quantity != null && quantity > 1 && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--charcoal)', color: 'var(--yellow)', fontSize: 12.5, fontWeight: 700 }}>×{quantity}</span>
        )}
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.3 }}>{product.Header}</div>
        {product.Beschreibung && (
          <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.Beschreibung}</div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          {product.Power != null && (
            <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 11.5, fontWeight: 700 }}>{product.Power}{product.Unit ? ` ${product.Unit}` : ''}</span>
          )}
          {product.Garantie && (
            <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 11.5, fontWeight: 700 }}>{product.Garantie}</span>
          )}
        </div>
        {product.hasSpec && product.Spezifikation && (
          <a href={product.Spezifikation} target="_blank" rel="noreferrer" style={{ marginTop: 'auto', paddingTop: 4, fontSize: 12.5, color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'underline' }}>
            <Icon name="file" size={13} />Datenblatt (PDF)
          </a>
        )}
      </div>
    </div>
  );
}
