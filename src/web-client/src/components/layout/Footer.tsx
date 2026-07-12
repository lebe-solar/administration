/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ background: 'var(--charcoal)', color: 'var(--cream)', marginTop: 'auto' }}>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/assets/logos/logo_simple.svg" alt="LeBe" style={{ height: 40 }} />
          <div>
            <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--yellow)' }}>LeBe Solarenergie GmbH</div>
            <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Die Sonne – unser Partner · Rödermark</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>
          <span>© 2026 LeBe Solarenergie</span>
          <Link href="/impressum" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Impressum</Link>
          <Link href="/datenschutz" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Datenschutz</Link>
          <Link href="/agb" style={{ cursor: 'pointer', textDecoration: 'underline' }}>AGB</Link>
        </div>
      </div>
    </footer>
  );
}
