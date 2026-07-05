import { useState } from 'react';
import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: string;
  type?: 'button' | 'submit';
}

const VARIANTS: Record<Variant, { bg: string; fg: string; bd: string; hb: string }> = {
  primary: { bg: 'var(--charcoal)', fg: 'var(--yellow)', bd: 'var(--charcoal)', hb: '#2c2c2b' },
  accent: { bg: 'var(--yellow)', fg: 'var(--charcoal)', bd: 'var(--yellow)', hb: '#ecdb00' },
  outline: { bg: 'transparent', fg: 'var(--charcoal)', bd: 'var(--gray-500)', hb: 'var(--gray-300)' },
  ghost: { bg: 'transparent', fg: 'var(--charcoal)', bd: 'transparent', hb: 'var(--gray-300)' },
  danger: { bg: '#c0392b', fg: '#fff', bd: '#c0392b', hb: '#a93226' },
};

export function AdminButton({ children, variant = 'primary', size = 'md', icon, disabled, style, type = 'button', ...rest }: AdminButtonProps) {
  const [h, setH] = useState(false);
  const pad = size === 'sm' ? '7px 12px' : size === 'lg' ? '13px 24px' : '10px 18px';
  const fs = size === 'sm' ? 13 : 15;
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button type={type} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: pad, fontSize: fs,
        fontFamily: 'var(--font-sans)', fontWeight: 600, color: v.fg,
        background: disabled ? 'var(--gray-400)' : (h ? v.hb : v.bg),
        border: `1px solid ${disabled ? 'var(--gray-400)' : v.bd}`, borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background-color .18s',
        ...style,
      } as CSSProperties}
      {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}{children}
    </button>
  );
}

export function IconAction({ icon, label, onClick, tone = 'default' }: { icon: string; label: string; onClick?: () => void; tone?: 'default' | 'danger' }) {
  const [h, setH] = useState(false);
  const colors = { default: 'var(--charcoal)', danger: '#c0392b' };
  return (
    <button onClick={onClick} title={label} aria-label={label}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid ' + (h ? 'var(--gray-500)' : 'transparent'), background: h ? 'var(--gray-300)' : 'transparent', color: colors[tone], cursor: 'pointer' }}>
      <Icon name={icon} size={17} />
    </button>
  );
}
