'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface InfoSplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image: string;
  imageAlt?: string;
  kicker?: ReactNode;
  title: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  reverse?: boolean;
  height?: number;
  style?: CSSProperties;
}

/** Full-bleed image + sage panel section block; `reverse` flips sides. */
export function InfoSplit({ image, imageAlt = '', kicker, title, cta, onCta, reverse = false, height = 480, style, ...rest }: InfoSplitProps) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: height, ...style }} {...rest}>
      <div style={{ order: reverse ? 2 : 1, minHeight: 220, backgroundColor: 'var(--gray-500)' }}>
        <img src={image} alt={imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div
        style={{
          order: reverse ? 1 : 2,
          backgroundColor: 'var(--sage)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 32,
          padding: '56px clamp(24px, 5vw, 96px)',
        }}
      >
        <div>
          {kicker && (
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p1)', color: 'var(--yellow)' }}>
              {kicker}
            </p>
          )}
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-semi)' as unknown as number,
              fontSize: 'var(--text-h3)',
              lineHeight: 'var(--lh-snug)',
              color: 'var(--yellow)',
              maxWidth: 520,
              textWrap: 'balance' as CSSProperties['textWrap'],
            }}
          >
            {title}
          </h2>
        </div>
        {cta && (
          <div>
            <button
              onClick={onCta}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-p5)',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--yellow)',
                backgroundColor: hover ? 'var(--yellow)' : 'transparent',
                color: hover ? 'var(--charcoal)' : 'var(--yellow)',
                cursor: 'pointer',
                transition: 'background-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
              }}
            >
              {cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
