'use client';

import { useState } from 'react';
import type { CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type CommonProps = {
  multiline?: boolean;
  rows?: number;
  invalid?: boolean;
  style?: CSSProperties;
};

type InputProps = CommonProps & InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Text input matching the offer/contact forms; sage focus ring. */
export function Input({ multiline = false, rows = 4, invalid = false, disabled = false, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focus, setFocus] = useState(false);
  const base: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-book)' as unknown as number,
    fontSize: 'var(--text-p5)',
    color: 'var(--charcoal)',
    backgroundColor: disabled ? 'var(--gray-400)' : 'var(--gray-300)',
    border: `1px solid ${invalid ? '#c0564a' : focus ? 'var(--sage)' : 'var(--gray-500)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    outline: 'none',
    boxShadow: focus ? '0 0 0 3px rgba(159,178,161,0.35)' : 'none',
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
    resize: multiline ? 'vertical' : undefined,
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        rows={rows}
        disabled={disabled}
        style={base}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    );
  }

  return (
    <input
      disabled={disabled}
      style={base}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
