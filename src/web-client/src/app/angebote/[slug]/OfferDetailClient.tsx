'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { DoughnutChart } from '@/components/ui/DoughnutChart';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { computeSystem, euro, keyFactsList, mainComponentsList, num, requirementsSplit, servicesList, techComponentsList } from '@/lib/offerCalc';
import { priceTypeLabel } from '@/lib/mockData';
import { compute, PRICE } from '@/lib/solarCalc';
import type { Offer } from '@/lib/types';

const pillStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '6px 13px', borderRadius: 'var(--radius-pill)',
  background: 'rgba(159,178,161,0.20)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number,
};

export function OfferDetailClient({ offer }: { offer: Offer }) {
  const sys = useMemo(() => computeSystem(offer.mainProducts), [offer]);
  const [consumption, setConsumption] = useState(offer.economics.annualConsumptionKwh);

  const calc = useMemo(() => compute(consumption, sys.pvPowerKwp || 0, sys.storageCapacityKwh || 0), [consumption, sys]);
  const savingsPct = consumption > 0 ? Math.min(999, (calc.totalBenefit / (consumption * PRICE)) * 100) : 0;

  const priceDisplay = offer.priceType === 'on_request' ? 'Auf Anfrage' : offer.priceType === 'starting_from' ? 'ab ' + euro(offer.priceAmount) : euro(offer.priceAmount);
  const keyFacts = useMemo(() => keyFactsList(offer), [offer]);
  const mainComponents = useMemo(() => mainComponentsList(offer), [offer]);
  const techComponents = useMemo(() => techComponentsList(offer), [offer]);
  const services = useMemo(() => servicesList(offer), [offer]);
  const { requirements, optionalWork } = useMemo(() => requirementsSplit(offer), [offer]);

  const systemStats: { value: string; label: string }[] = [];
  if (sys.pvPowerKwp) systemStats.push({ value: num(sys.pvPowerKwp, 1) + ' kWp', label: 'PV-Leistung' });
  if (sys.moduleCount) systemStats.push({ value: String(sys.moduleCount), label: 'Solarmodule' });
  if (sys.moduleAreaM2) systemStats.push({ value: num(sys.moduleAreaM2, 1) + ' m²', label: 'Modulfläche' });
  if (sys.storageCapacityKwh) systemStats.push({ value: num(sys.storageCapacityKwh, 1) + ' kWh', label: 'Speicher' });
  if (sys.inverterPowerKw) systemStats.push({ value: num(sys.inverterPowerKw, 1) + ' kW', label: 'Wechselrichter' });
  if (sys.wallboxPowerKw) systemStats.push({ value: num(sys.wallboxPowerKw, 0) + ' kW', label: 'Wallbox' });

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 0' }}>
        <Link href="/angebote" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', cursor: 'pointer' }}>
          ← Alle Angebote
        </Link>
      </div>

      {/* 1 · HERO */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--sage)', boxShadow: 'var(--shadow-card)', aspectRatio: '4 / 3' }}>
            <img src={offer.previewImageUrl} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {offer.badge && (
              <span style={{ alignSelf: 'flex-start', display: 'inline-flex', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                {offer.badge}
              </span>
            )}
            <h1 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)' }}>{offer.title}</h1>
            <p style={{ margin: 0, fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)' }}>{offer.subtitle}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {keyFacts.map((k) => (
                <span key={k} style={pillStyle}>{k}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <span style={{ color: 'var(--sage)', fontSize: 18, lineHeight: 1.4 }}>✓</span>
              <span style={{ fontSize: 'var(--text-p5)', lineHeight: 'var(--lh-body)' }}>{offer.designedFor}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>{priceTypeLabel[offer.priceType]}</div>
                <div style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 1.05 }}>{priceDisplay}</div>
              </div>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', paddingBottom: 6 }}>Gültig bis {offer.validUntil}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href={`/kontakt?intent=offerPackage&offer=${offer.slug}`}><Button variant="solid" tone="ink" size="lg">Paket unverbindlich anfragen</Button></Link>
              <Button variant="outline" tone="ink" size="lg" disabled>Als PDF</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · USP */}
      <section style={{ background: 'var(--charcoal)', margin: '48px 0 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 24px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--yellow)' }}>Alles drin. Alles transparent. Alles aus regionaler Hand.</h2>
        </div>
      </section>

      {/* WIRTSCHAFTLICHKEIT */}
      <section style={{ maxWidth: 1180, margin: '52px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '32px 34px 36px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihre Wirtschaftlichkeit</p>
          <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihre Ersparnis auf einen Blick</h2>
          <p style={{ margin: '0 0 22px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 640, lineHeight: 'var(--lh-body)' }}>
            Stellen Sie Ihren Stromverbrauch ein – PV-Leistung und Speichergröße stammen aus diesem Paket.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <RangeSlider label="Stromverbrauch" valueLabel={`${num(consumption)} kWh`} min={2000} max={15000} step={100} value={consumption} onChange={setConsumption} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>PV-Leistung</div>
                  <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{num(sys.pvPowerKwp || 0, 1)} kWp</div>
                </div>
                <div style={{ flex: 1, background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Speicher</div>
                  <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{num(sys.storageCapacityKwh || 0, 1)} kWh</div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: -8 }}>aus diesem Paket</div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Gesamtvorteil pro Jahr</div>
                <div style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', lineHeight: 1.1 }}>{euro(calc.totalBenefit)}</div>
                <div style={{ display: 'flex', gap: 22, marginTop: 12 }}>
                  <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Einsparung</div><div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{euro(calc.savings)}</div></div>
                  <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Einspeisung</div><div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{euro(calc.feedIn)}</div></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>Eigenverbrauchsanteil</div>
                <DoughnutChart pct={calc.eigenPct} color="#9fb2a1" label="Eigenverbrauch" />
              </div>
              <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>Autarkiegrad</div>
                <DoughnutChart pct={calc.autarkPct} color="#3c3c3b" label="Autarkie" />
              </div>
              <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 10 }}>Ersparnis ggü. Netzbezug</div>
                <div style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)', lineHeight: 1 }}>{num(savingsPct)}%</div>
              </div>
            </div>
          </div>
          <p style={{ margin: '22px 0 0', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{offer.economics.disclaimer}</p>
          <div style={{ marginTop: 16 }}>
            <Link href="/pv-simulator"><Button variant="outline" tone="sage">Mit dem PV-Simulator weiter vergleichen</Button></Link>
          </div>
        </div>
      </section>

      {/* 3 · SYSTEMÜBERSICHT */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '52px 24px 0' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihre Anlage im Überblick</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
          {systemStats.map((s) => (
            <div key={s.label} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '18px 16px' }}>
              <div style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 1.05 }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · HAUPTKOMPONENTEN */}
      <section style={{ maxWidth: 1180, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p6)' }}>1</span>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Hauptkomponenten</h2>
        </div>
        <p style={{ margin: '0 0 22px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', paddingLeft: 42 }}>Die zentralen Markenprodukte Ihrer Anlage.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {mainComponents.map((c) => (
            <div key={c.slotKey} style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, padding: '20px 20px 0' }}>
                <img src={c.image} alt={c.name} style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }} />
                {c.hasLogo && (
                  <span style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%', background: 'var(--white)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={c.logo} alt={c.manufacturer} style={{ maxWidth: 28, maxHeight: 28, objectFit: 'contain' }} />
                  </span>
                )}
              </div>
              <div style={{ padding: '18px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p2)', color: 'var(--charcoal)' }}>{c.name}</h3>
                <p style={{ margin: 0, fontWeight: 'var(--fw-book)' as unknown as number, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>{c.beschreibung}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{c.powerLabel}</span>
                  <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Garantie: {c.warranty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · TECHNIK & ZUBEHÖR */}
      <section style={{ maxWidth: 1180, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p6)' }}>2</span>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Technik &amp; Zubehör inklusive</h2>
        </div>
        <p style={{ margin: '0 0 22px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', paddingLeft: 42 }}>Alle technischen Komponenten für einen sicheren, intelligenten Betrieb – ohne Aufpreis.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {techComponents.map((t) => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-md)', padding: '15px 17px' }}>
              <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', background: 'rgba(159,178,161,0.22)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</span>
              <div>
                <div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{t.label}</div>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', marginTop: 2 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · LEISTUNGEN INKLUSIVE */}
      <section style={{ background: 'var(--cream)', margin: '48px 0 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p6)' }}>3</span>
            <h2 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Leistungen inklusive</h2>
          </div>
          <p style={{ margin: '0 0 22px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', paddingLeft: 42 }}>Von der Planung bis zur Einweisung – alles aus einer Hand.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px' }}>
            {services.map((s) => (
              <div key={s.name} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--gray-500)' }}>
                <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>✓</span>
                <div>
                  <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{s.name}</div>
                  {s.descriptionLines.map((ln) => (
                    <div key={ln} style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', marginTop: 2 }}>{ln}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · VORAUSSETZUNGEN & ZUSATZARBEITEN */}
      <section style={{ maxWidth: 1180, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p6)' }}>4</span>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Voraussetzungen &amp; mögliche Zusatzarbeiten</h2>
        </div>
        <p style={{ margin: '0 0 22px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', paddingLeft: 42, maxWidth: 700 }}>Falls Zusatzarbeiten notwendig sind, werden diese vorab transparent besprochen und separat angeboten.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div style={{ background: 'rgba(159,178,161,0.14)', border: '1px solid var(--sage)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Voraussetzungen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {requirements.map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginTop: 2 }}>✓</span>
                  <div><div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{r.title}</div><div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{r.description}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Mögliche Zusatzarbeiten nach Prüfung</h3>
            <p style={{ margin: '0 0 14px', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Nicht im Festpreis enthalten – nur bei Bedarf relevant.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {optionalWork.map((w) => (
                <div key={w.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--gray-500)', color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>+</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{w.title}</span><span style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', whiteSpace: 'nowrap' }}>{w.priceLabel}</span></div>
                    <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{w.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9 · ABLAUF */}
      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>So geht es nach Ihrer Anfrage weiter</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {offer.process.map((p) => (
            <div key={p.step} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{p.step}</span>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{p.title}</div>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 10 · FAQ */}
      <section style={{ maxWidth: 820, margin: '56px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 22px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Häufige Fragen</h2>
        <Accordion items={offer.faq} />
      </section>

      {/* 11 · FINAL CTA */}
      <section style={{ maxWidth: 1180, margin: '56px auto 90px', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', background: 'var(--sage)', borderRadius: 'var(--radius-lg)', padding: '26px 34px' }}>
          <div>
            <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{offer.title} – {priceDisplay}</div>
            <div style={{ fontSize: 'var(--text-p5)', color: 'var(--charcoal)', opacity: 0.8 }}>Kostenlos &amp; unverbindlich anfragen. Wir melden uns innerhalb von 24 Stunden.</div>
          </div>
          <Link href={`/kontakt?intent=offerPackage&offer=${offer.slug}`}><Button variant="solid" tone="ink" size="lg">Paket unverbindlich anfragen</Button></Link>
        </div>
      </section>
    </div>
  );
}
