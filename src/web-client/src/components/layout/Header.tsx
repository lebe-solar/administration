'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/angebote', label: 'Angebote' },
  { href: '/pv-simulator', label: 'PV-Simulator' },
  { href: '/produkte', label: 'Produkte' },
  { href: '/ueber-uns', label: 'Über uns' },
  { href: '/wissen', label: 'Wissen' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--sage)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <img src="/assets/logos/logo_simple.svg" alt="LeBe Solarenergie" style={{ height: 52, width: 'auto', display: 'block' }} />
          <img src="/assets/logos/Logo_schrift.png" alt="LeBe Solarenergie" style={{ height: 26, width: 'auto', display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ fontSize: 'var(--text-p4)', color: 'var(--charcoal)', cursor: 'pointer', fontWeight: (active ? 'var(--fw-semi)' : 'var(--fw-book)') as unknown as number }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/kontakt"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 46,
              padding: '0 24px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--charcoal)',
              color: 'var(--yellow)',
              fontSize: 'var(--text-p5)',
              fontWeight: 'var(--fw-semi)' as unknown as number,
              cursor: 'pointer',
            }}
          >
            Kontakt
          </Link>
        </nav>
      </div>
    </header>
  );
}
