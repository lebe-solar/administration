import { useState } from 'react';
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, CSSProperties } from 'react';
import { Icon } from './Icon';

export function Field({ label, required, hint, error, children }: { label?: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)' }}>{label}{required && <span style={{ color: '#c0392b' }}> *</span>}</span>}
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#c0392b', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="alert" size={12} />{error}</span>}
    </label>
  );
}

const fieldBase = (err?: string): CSSProperties => ({
  width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--charcoal)',
  background: 'var(--white)', border: `1px solid ${err ? '#c0392b' : 'var(--gray-500)'}`, borderRadius: 'var(--radius-sm)',
  padding: '10px 12px', outline: 'none',
});

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> { error?: string }
export function TextInput({ error, style, onFocus, onBlur, ...p }: TextInputProps) {
  const [f, setF] = useState(false);
  return (
    <input {...p}
      onFocus={e => { setF(true); onFocus?.(e); }}
      onBlur={e => { setF(false); onBlur?.(e); }}
      style={{ ...fieldBase(error), boxShadow: f ? '0 0 0 3px rgba(159,178,161,0.35)' : 'none', borderColor: error ? '#c0392b' : (f ? 'var(--sage)' : 'var(--gray-500)'), ...style }} />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { error?: string }
export function TextArea({ error, style, onFocus, onBlur, ...p }: TextAreaProps) {
  const [f, setF] = useState(false);
  return (
    <textarea {...p}
      onFocus={e => { setF(true); onFocus?.(e); }}
      onBlur={e => { setF(false); onBlur?.(e); }}
      style={{ ...fieldBase(error), resize: 'vertical', minHeight: 84, boxShadow: f ? '0 0 0 3px rgba(159,178,161,0.35)' : 'none', borderColor: error ? '#c0392b' : (f ? 'var(--sage)' : 'var(--gray-500)'), ...style }} />
  );
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> { error?: string }
export function SelectInput({ error, children, style, ...p }: SelectInputProps) {
  return (
    <select {...p}
      style={{
        ...fieldBase(error), appearance: 'none',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%233C3C3B' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 34, cursor: 'pointer', ...style,
      }}>
      {children}
    </select>
  );
}
