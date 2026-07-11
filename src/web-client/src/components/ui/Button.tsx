'use client';

import { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'solid' | 'outline' | 'ghost';
type Tone = 'ink' | 'yellow' | 'sage';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children?: ReactNode;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  type?: 'button' | 'submit';
}

const SIZES: Record<Size, { padding: string; font: string }> = {
  sm: { padding: '8px 20px', font: 'var(--text-p6)' },
  md: { padding: '12px 28px', font: 'var(--text-p5)' },
  lg: { padding: '16px 40px', font: 'var(--text-p4)' },
};

const TONE_COLOR: Record<Tone, string> = {
  ink: 'var(--charcoal)',
  yellow: 'var(--yellow)',
  sage: 'var(--sage)',
};

/** Fully-rounded pill button matching the homepage CTAs. */
export function Button({
  children,
  variant = 'outline',
  tone = 'ink',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const toneColor = TONE_COLOR[tone];
  const s = SIZES[size] || SIZES.md;

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-book)' as unknown as number,
    fontSize: s.font,
    lineHeight: 1,
    padding: s.padding,
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition:
      'background-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    border: '1px solid transparent',
  };

  const variants: Record<Variant, CSSProperties> = {
    solid: {
      backgroundColor: toneColor,
      color: tone === 'yellow' ? 'var(--charcoal)' : 'var(--yellow)',
      borderColor: toneColor,
    },
    outline: {
      backgroundColor: 'transparent',
      color: toneColor,
      borderColor: toneColor,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: toneColor,
      borderColor: 'transparent',
    },
  };

  let hoverStyle: CSSProperties = {};
  if (!disabled && hover) {
    if (variant === 'outline') {
      hoverStyle = {
        backgroundColor: toneColor,
        color: tone === 'yellow' ? 'var(--charcoal)' : 'var(--cream)',
      };
    } else if (variant === 'solid') {
      hoverStyle = { filter: 'brightness(0.92)' };
    } else {
      hoverStyle = { backgroundColor: 'rgba(60,60,59,0.06)' };
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
