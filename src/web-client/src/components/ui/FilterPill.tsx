import type { CSSProperties, LabelHTMLAttributes } from 'react';

interface FilterPillProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'onSelect'> {
  label: string;
  checked?: boolean;
  onSelect?: () => void;
  name?: string;
  style?: CSSProperties;
}

/** Radio-style outline filter chip; single-select rows. */
export function FilterPill({ label, checked = false, onSelect, name, style, ...rest }: FilterPillProps) {
  return (
    <label
      onClick={onSelect}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--charcoal)',
        background: checked ? 'rgba(159,178,161,0.16)' : 'transparent',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-p5)',
        color: 'var(--charcoal)',
        userSelect: 'none',
        transition: 'background-color var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `2px solid ${checked ? 'var(--sage)' : 'var(--gray-500)'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />}
      </span>
      <input type="radio" name={name} checked={checked} onChange={() => {}} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      {label}
    </label>
  );
}
