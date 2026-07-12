import type { ReactNode } from 'react';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
  disclaimer?: string;
}

/** Shared layout for Impressum/Datenschutz/AGB — simple hero + stacked sections. */
export function LegalPage({ title, sections, disclaimer }: LegalPageProps) {
  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <section style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 56px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Rechtliches</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)' }}>{title}</h1>
        </div>
      </section>
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {sections.map((s) => (
          <div key={s.heading}>
            <h3 style={{ margin: '0 0 10px', fontSize: 'var(--text-h6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{s.heading}</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>{s.body}</p>
          </div>
        ))}
        {disclaimer && <p style={{ margin: 0, fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{disclaimer}</p>}
      </section>
    </div>
  );
}
