import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type Tone = 'sage' | 'yellow' | 'ink' | 'neutral';
type Variant = 'solid' | 'soft';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  tone?: Tone;
  variant?: Variant;
  style?: CSSProperties;
}

const MAP: Record<Tone, Record<Variant, [string, string]>> = {
  sage: { solid: ['var(--sage)', 'var(--charcoal)'], soft: ['rgba(159,178,161,0.22)', 'var(--charcoal)'] },
  yellow: { solid: ['var(--yellow)', 'var(--charcoal)'], soft: ['rgba(255,237,0,0.28)', 'var(--charcoal)'] },
  ink: { solid: ['var(--charcoal)', 'var(--yellow)'], soft: ['rgba(60,60,59,0.08)', 'var(--charcoal)'] },
  neutral: { solid: ['var(--gray-500)', 'var(--charcoal)'], soft: ['var(--gray-400)', 'var(--gray-mid)'] },
};

/** Small pill label — offer flags, hashtags, status chips. */
export function Badge({ children, tone = 'sage', variant = 'soft', style, ...rest }: BadgeProps) {
  const [bg, fg] = MAP[tone][variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-semi)' as unknown as number,
        fontSize: 'var(--text-p6)',
        lineHeight: 1,
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: bg,
        color: fg,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
