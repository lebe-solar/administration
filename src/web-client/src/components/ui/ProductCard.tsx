/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'translate'> {
  image?: string;
  imageAlt?: string;
  name: ReactNode;
  header?: ReactNode;
  description?: ReactNode;
  power?: ReactNode;
  unit?: ReactNode;
  guarantee?: ReactNode;
  datasheetHref?: string;
  datasheetLabel?: string;
  style?: CSSProperties;
}

/** Catalog card from the products page. */
export function ProductCard({
  image,
  imageAlt = '',
  name,
  header,
  description,
  power,
  unit,
  guarantee,
  datasheetHref = '#',
  datasheetLabel = 'Zum Datenblatt',
  style,
  ...rest
}: ProductCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, padding: '20px 20px 0' }}>
        {image && <img src={image} alt={imageAlt || String(name)} style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }} />}
      </div>
      <div style={{ padding: '18px 22px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <h3 style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p2)', color: 'var(--charcoal)' }}>{name}</h3>
        {header && <p style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>{header}</p>}
        {description && (
          <p style={{ margin: 0, fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
            {description}
          </p>
        )}
        {(power || unit) && (
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>
            {power} {unit}
          </p>
        )}
        {guarantee && (
          <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>
            <span style={{ fontWeight: 'var(--fw-semi)' as unknown as number }}>Garantie:</span> {guarantee}
          </p>
        )}
        <a
          href={datasheetHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--gray-400)',
            color: 'var(--charcoal)',
            fontSize: 'var(--text-p5)',
            textDecoration: 'none',
            transition: 'background-color var(--dur-base) var(--ease-standard)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sage)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gray-400)')}
        >
          <span aria-hidden="true" style={{ fontSize: 15 }}>↗</span>
          {datasheetLabel}
        </a>
      </div>
    </div>
  );
}
