'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode, MouseEventHandler } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'title'> {
  image?: string;
  imageAlt?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  price?: ReactNode;
  priceLabel?: string;
  hoverYellow?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}

/** Package/offer card from the homepage carousel; washes to yellow on hover. */
export function Card({
  image,
  imageAlt = '',
  title,
  subtitle,
  meta,
  price,
  priceLabel = 'Preis ab:',
  hoverYellow = true,
  children,
  onClick,
  style,
  ...rest
}: CardProps) {
  const [hover, setHover] = useState(false);
  const bg = hover && hoverYellow ? 'var(--yellow)' : 'var(--white)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: bg,
        boxShadow: 'var(--shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color var(--dur-base) var(--ease-standard)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      {image && (
        <div style={{ backgroundColor: 'var(--sage)', display: 'flex', justifyContent: 'center' }}>
          <img src={image} alt={imageAlt} style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      {(title || subtitle || price || children) && (
        <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {title && (
            <h3 style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p2)', color: 'var(--charcoal)' }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>
              {subtitle}
            </p>
          )}
          {meta && <p style={{ margin: 0, fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--gray-mid)' }}>{meta}</p>}
          {price && (
            <p style={{ margin: '6px 0 0', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>
              <span style={{ fontWeight: 'var(--fw-book)' as unknown as number }}>{priceLabel} </span>
              {price}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
