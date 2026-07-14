import type { CSSProperties } from 'react';
import type { Product } from '../../types';

// The unified product card used everywhere a real catalog product is shown to a
// customer-facing or near-customer-facing surface: the offer builder's Hauptprodukte step,
// the offer detail preview's Hauptkomponenten section, and the product view/edit pages.
// Matches the source design (LeBe Web Page Client.dc.html, Hauptkomponenten card) exactly:
// contain-fit image on a 200px pad, circular logo badge top-right, yellow power/warranty
// pill badges, and a plain sage "Datenblatt (PDF)" link — never a button.
export function ProductCard({ product, quantity, style }: { product: Product; quantity?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', fontFamily: 'var(--font-sans)', ...style }}>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, padding: '20px 20px 0' }}>
        {product.image && <img src={product.image} alt={product.Header} style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }} />}
        {product.Logo && (
          <span style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%', background: 'var(--white)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={product.Logo} alt={product.Hersteller} style={{ maxWidth: 28, maxHeight: 28, objectFit: 'contain' }} />
          </span>
        )}
        {quantity != null && quantity > 1 && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--charcoal)', color: 'var(--yellow)', fontSize: 12.5, fontWeight: 700 }}>×{quantity}</span>
        )}
      </div>
      <div style={{ padding: '18px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--charcoal)' }}>{product.Header}</h3>
        {product.Beschreibung && (
          <p style={{ margin: 0, fontWeight: 400, fontSize: 13.5, color: 'var(--charcoal)', lineHeight: 1.5 }}>{product.Beschreibung}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
          {product.Power != null && (
            <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 12.5, fontWeight: 700 }}>{product.Power}{product.Unit ? ` ${product.Unit}` : ''}</span>
          )}
          {product.Garantie && (
            <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 12.5, fontWeight: 700 }}>Garantie: {product.Garantie}</span>
          )}
        </div>
        {product.hasSpec && product.Spezifikation && (
          <a href={product.Spezifikation} target="_blank" rel="noreferrer" style={{ marginTop: 'auto', paddingTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--sage)', textDecoration: 'none' }}>
            <span aria-hidden="true">⬇</span> Datenblatt (PDF)
          </a>
        )}
      </div>
    </div>
  );
}
