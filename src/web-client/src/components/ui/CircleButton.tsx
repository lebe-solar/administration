'use client';

import { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Tone = 'ink' | 'yellow' | 'sage';

interface CircleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children?: ReactNode;
  size?: number;
  tone?: Tone;
  style?: CSSProperties;
}

/** Floating circular action button (e.g. "Kontakt"). */
export function CircleButton({ children, size = 96, tone = 'ink', onClick, style, ...rest }: CircleButtonProps) {
  const bg: Record<Tone, string> = { ink: 'var(--charcoal)', sage: 'var(--sage)', yellow: 'var(--yellow)' };
  const fg = tone === 'yellow' ? 'var(--charcoal)' : 'var(--yellow)';
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: bg[tone],
        color: fg,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-p5)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow-raised)',
        transition: 'transform var(--dur-base) var(--ease-standard), filter var(--dur-base) var(--ease-standard)',
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
