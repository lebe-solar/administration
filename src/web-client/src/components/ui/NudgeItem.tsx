/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface NudgeItemProps extends HTMLAttributes<HTMLDivElement> {
  icon: string | ReactNode;
  iconSize?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Trust-signal column: large line icon + short centered caption. */
export function NudgeItem({ icon, iconSize = 96, children, style, ...rest }: NudgeItemProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 300, textAlign: 'center', ...style }} {...rest}>
      {typeof icon === 'string' ? (
        <img src={icon} alt="" style={{ width: iconSize, height: 'auto' }} />
      ) : (
        <span style={{ width: iconSize, display: 'inline-flex', justifyContent: 'center' }}>{icon}</span>
      )}
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p4)', lineHeight: 'var(--lh-body)', color: 'var(--charcoal)' }}>
        {children}
      </p>
    </div>
  );
}
