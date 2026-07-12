'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function DankeContent() {
  const searchParams = useSearchParams();
  const summary = searchParams.get('summary');

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '90px 24px 120px', textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, margin: '0 auto 26px', borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>✓</div>
        <h1 style={{ margin: '0 0 14px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Vielen Dank für Ihre Anfrage!</h1>
        <p style={{ margin: '0 auto 30px', fontSize: 'var(--text-p3)', color: 'var(--gray-mid)', maxWidth: 520, lineHeight: 'var(--lh-body)' }}>
          Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden persönlich bei Ihnen. Die Sonne – unser Partner.
        </p>
        {summary && (
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '14px 18px', margin: '0 auto 30px', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-p6)', color: 'var(--charcoal)' }}>
            <span style={{ color: 'var(--sage)' }}>✓</span>{summary}
          </div>
        )}
        <div>
          <Link href="/angebote"><Button variant="solid" tone="ink" size="lg">Zurück zu den Angeboten</Button></Link>
        </div>
      </section>
    </div>
  );
}
