'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { ProductCard } from '@/components/ui/ProductCard';
import type { ProductsPageData } from '@/lib/types';

export function ProduktePageClient({ data }: { data: ProductsPageData }) {
  const [manuf, setManuf] = useState('Alle');
  const [cat, setCat] = useState<string>('Alle');

  const { products, manufacturers, groupedProducts, fetchError } = data;

  const manufByName = useMemo(() => {
    const map: Record<string, ProductsPageData['manufacturers'][number]> = {};
    manufacturers.forEach((m) => { map[m.name] = m; });
    return map;
  }, [manufacturers]);

  const categoryOptions = groupedProducts.map((g) => ({ key: g.category, label: g.label }));

  const filtered = products.filter((p) => (manuf === 'Alle' || p.manufacturer === manuf) && (cat === 'Alle' || p.category === cat));
  const hasSpotlight = manuf !== 'Alle';
  const spotlightManufacturer = hasSpotlight ? manufByName[manuf] : null;
  const spotlight = spotlightManufacturer
    ? { name: spotlightManufacturer.name, logo: spotlightManufacturer.logo, desc: spotlightManufacturer.description || 'Geprüfter Partner von LeBe Solarenergie.' }
    : null;
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

      {fetchError ? (
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>
          <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--charcoal)' }}>Produkte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
          </div>
        </section>
      ) : (
        <>
          <section style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 0' }}>
            <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Hersteller</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
              {['Alle', ...manufacturers.map((m) => m.name)].map((m) => {
                const checked = manuf === m;
                const logo = m === 'Alle' ? null : manufByName[m]?.logo;
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
              {[{ key: 'Alle', label: 'Alle' }, ...categoryOptions].map((c) => (
                <FilterPill key={c.key} label={c.label} checked={cat === c.key} onSelect={() => setCat(c.key)} name="cat" />
              ))}
            </div>
          </section>

          {spotlight && (
            <section style={{ maxWidth: 1180, margin: '30px auto 0', padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '24px 28px' }}>
                {spotlight.logo && (
                  <div style={{ width: 140, height: 64, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={spotlight.logo} alt={spotlight.name} style={{ maxWidth: 130, maxHeight: 56, objectFit: 'contain' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{spotlight.name}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{spotlight.desc}</p>
                </div>
              </div>
            </section>
          )}

          <section style={{ maxWidth: 1180, margin: '30px auto 0', padding: '0 24px 80px' }}>
            {products.length === 0 ? (
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '48px 28px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--charcoal)' }}>Aktuell sind keine Produkte veröffentlicht.</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', marginBottom: 18 }}>{productCountLabel}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      image={p.image || undefined}
                      imageAlt={p.name}
                      logo={p.logo || undefined}
                      logoAlt={p.manufacturer}
                      name={p.name}
                      description={p.beschreibung}
                      power={p.power}
                      unit={p.unit}
                      guarantee={p.warranty}
                      datasheetHref={p.specPdf || undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}

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
