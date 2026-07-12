import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';

type Color = 'ink' | 'sage' | 'invert';
type Size = 'h1' | 'h3' | 'h4' | 'h5';
type Align = 'left' | 'center' | 'right';

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  kicker?: ReactNode;
  children?: ReactNode;
  align?: Align;
  color?: Color;
  size?: Size;
  as?: ElementType;
  style?: CSSProperties;
}

const COLOR: Record<Color, string> = { ink: 'var(--charcoal)', sage: 'var(--sage)', invert: 'var(--yellow)' };
const FONT_SIZE: Record<Size, string> = { h1: 'var(--text-h1)', h3: 'var(--text-h3)', h4: 'var(--text-h4)', h5: 'var(--text-h5)' };

/** Recurring section header: optional kicker line above a semibold heading. */
export function SectionHeading({ kicker, children, align = 'center', color = 'ink', size = 'h4', as: Tag = 'h2', style, ...rest }: SectionHeadingProps) {
  const c = COLOR[color] || COLOR.ink;
  const fs = FONT_SIZE[size] || FONT_SIZE.h4;
  const kickerColor = color === 'invert' ? 'var(--cream)' : color === 'sage' ? 'var(--sage)' : 'var(--gray-mid)';

  return (
    <div style={{ textAlign: align, ...style }} {...rest}>
      {kicker && (
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p3)', color: kickerColor, margin: '0 0 8px' }}>
          {kicker}
        </p>
      )}
      <Tag
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-semi)' as unknown as number,
          fontSize: fs,
          lineHeight: 'var(--lh-snug)',
          color: c,
          margin: 0,
          textWrap: 'balance' as CSSProperties['textWrap'],
        }}
      >
        {children}
      </Tag>
    </div>
  );
}
