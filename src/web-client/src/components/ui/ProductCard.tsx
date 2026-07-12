/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'translate'> {
  image?: string;
  imageAlt?: string;
  logo?: string;
  logoAlt?: string;
  name: ReactNode;
  header?: ReactNode;
  description?: ReactNode;
  power?: ReactNode;
  unit?: ReactNode;
  guarantee?: ReactNode;
  datasheetHref?: string;
  style?: CSSProperties;
}

/** Catalog card from the products page. */
export function ProductCard({
  image,
  imageAlt = '',
  logo,
  logoAlt = '',
  name,
  header,
  description,
  power,
  unit,
  guarantee,
  datasheetHref,
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
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, padding: '20px 20px 0' }}>
        {image && <img src={image} alt={imageAlt || String(name)} style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }} />}
        {logo && (
          <span style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%', background: 'var(--white)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={logo} alt={logoAlt} style={{ maxWidth: 28, maxHeight: 28, objectFit: 'contain' }} />
          </span>
        )}
      </div>
      <div style={{ padding: '18px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p2)', color: 'var(--charcoal)' }}>{name}</h3>
        {header && <p style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>{header}</p>}
        {description && (
          <p style={{ margin: 0, fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
            {description}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
          {(power || unit) && (
            <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
              {power} {unit}
            </span>
          )}
          {guarantee && (
            <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
              Garantie: {guarantee}
            </span>
          )}
        </div>
        {datasheetHref && (
          <a
            href={datasheetHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 'auto',
              paddingTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--text-p5)',
              fontWeight: 'var(--fw-semi)' as unknown as number,
              color: 'var(--sage)',
              textDecoration: 'none',
            }}
          >
            <span aria-hidden="true">⬇</span> Datenblatt (PDF)
          </a>
        )}
      </div>
    </div>
  );
}
