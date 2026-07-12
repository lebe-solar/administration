'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { ProductCard } from '@/components/ui/ProductCard';
import { categories, products } from '@/lib/mockData';

const brandDesc: Record<string, string> = {
  Aiko: 'Weltmarktführer für ABC-Zellen mit branchenweit führenden Wirkungsgraden.',
  SENEC: 'Deutscher Speicherpionier – All-in-One-Systeme inkl. Cloud und App.',
  Fronius: 'Österreichischer Hersteller für zuverlässige Hybridwechselrichter & Speicher.',
  Sungrow: 'Einer der weltgrößten Wechselrichter-Hersteller mit starkem Preis-Leistungs-Verhältnis.',
  SMA: 'Traditionsmarke aus Nordhessen – robuste Wechselrichter für Gewerbe & Privat.',
  SolarEdge: 'Modul-Optimierer-Ökosystem für maximale Erträge auch bei Teilverschattung.',
  Bauer: 'Deutscher Modulhersteller mit langlebiger Glas-Glas-Bauweise.',
  'Solar Fabrik': 'Full-Black-Module mit hochwertiger Optik und zuverlässiger Leistung für moderne PV-Anlagen.',
};

export default function ProduktePage() {
  const [manuf, setManuf] = useState('Alle');
  const [cat, setCat] = useState<string>('Alle');

  const manufacturers = useMemo(() => ['Alle', ...Array.from(new Set(products.map((p) => p.hersteller)))], []);
  const logoByBrand = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => {
      if (p.hersteller && !map[p.hersteller]) map[p.hersteller] = p.logo;
    });
    return map;
  }, []);

  const filtered = products.filter((p) => (manuf === 'Alle' || p.hersteller === manuf) && (cat === 'Alle' || p.category === cat));
  const hasSpotlight = manuf !== 'Alle';
  const spotlight = hasSpotlight ? { name: manuf, logo: logoByBrand[manuf], desc: brandDesc[manuf] || 'Geprüfter Partner von LeBe Solarenergie.' } : null;
  const productCountLabel = filtered.length + (filtered.length === 1 ? ' Produkt' : ' Produkte');

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <section style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 24px 40px' }}>
          <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', marginBottom: 10 }}>
            <Link href="/" style={{ cursor: 'pointer' }}>Start</Link> / Produkte
          </div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Unsere Produkte</h1>
          <p style={{ margin: '14px 0 0', fontSize: 'var(--text-p4)', color: 'var(--charcoal)', maxWidth: 640, lineHeight: 'var(--lh-body)' }}>
            Alle Komponenten stammen direkt aus unserer Produktverwaltung – gepflegt im LeBe-Admin und hier in Echtzeit gelistet.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Hersteller</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          {manufacturers.map((m) => {
            const checked = manuf === m;
            const logo = logoByBrand[m];
            return (
              <label
                key={m}
                onClick={() => setManuf(m)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '5px 14px 5px 6px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--charcoal)', background: checked ? 'rgba(159,178,161,0.16)' : 'transparent' }}
              >
                {logo && (
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden' }}>
                    <img src={logo} alt={m} style={{ maxWidth: 16, maxHeight: 16, objectFit: 'contain' }} />
                  </span>
                )}
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${checked ? 'var(--sage)' : 'var(--gray-500)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />}
                </span>
                <span style={{ fontSize: 'var(--text-p5)', color: 'var(--charcoal)' }}>{m}</span>
              </label>
            );
          })}
        </div>
        <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Produkttyp</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['Alle', ...categories.map((c) => c.key)].map((c) => (
            <FilterPill key={c} label={c} checked={cat === c} onSelect={() => setCat(c)} name="cat" />
          ))}
        </div>
      </section>

      {spotlight && (
        <section style={{ maxWidth: 1180, margin: '30px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '24px 28px' }}>
            <div style={{ width: 140, height: 64, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={spotlight.logo} alt={spotlight.name} style={{ maxWidth: 130, maxHeight: 56, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{spotlight.name}</div>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{spotlight.desc}</p>
            </div>
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1180, margin: '30px auto 0', padding: '0 24px 80px' }}>
        <div style={{ fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', marginBottom: 18 }}>{productCountLabel}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              image={p.image}
              imageAlt={p.header}
              name={p.header}
              description={p.beschreibung}
              power={p.power}
              unit={p.unit}
              guarantee={p.garantie}
            />
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '30px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>Unsicher, welche Komponente passt?</div>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 480, lineHeight: 'var(--lh-body)' }}>Wir prüfen gerne, welche Komponente zu Ihrem Projekt passt.</p>
          </div>
          <Link href="/kontakt?intent=productQuestion"><Button variant="solid" tone="ink">Beratung zu Komponenten anfragen</Button></Link>
        </div>
      </section>
    </div>
  );
}
