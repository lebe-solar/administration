import type { CSSProperties, LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  required?: boolean;
  style?: CSSProperties;
}

/** Form field label with optional required mark. */
export function Label({ children, required = false, htmlFor, style, ...rest }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-book)' as unknown as number,
        fontSize: 'var(--text-p4)',
        color: 'var(--charcoal)',
        marginBottom: 8,
        ...style,
      }}
      {...rest}
    >
      {children}
      {required && <span title="Pflichtfeld" style={{ fontWeight: 'var(--fw-semi)' as unknown as number }}> *</span>}
    </label>
  );
}
