'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { offers } from '@/lib/mockData';
import { computeSystem, euro, mainComponentsList, num } from '@/lib/offerCalc';
import { compute } from '@/lib/solarCalc';

const heroTrustPoints = ['Regional aus Rödermark', '100+ Photovoltaikanlagen', 'Persönliche Beratung', 'Alles aus einer Hand'];

const landingTrustCards = [
  { icon: '/assets/icons/icn_hand.svg', title: 'Hessisch und persönlich', text: 'Regional verwurzelt in Rödermark und im Rhein-Main-Gebiet persönlich für Sie unterwegs.' },
  { icon: '/assets/icons/icn_montage.svg', title: 'Komplett aus einer Hand', text: 'Beratung, Planung, Montage, Elektroinstallation, Anmeldung und Inbetriebnahme in einem koordinierten Ablauf.' },
  { icon: '/assets/icons/icn_anmeldung.svg', title: 'Transparent geplant', text: 'Sie sehen früh, welche Komponenten, Leistungen und Voraussetzungen für Ihr Projekt relevant sind.' },
  { icon: '/assets/icons/icn_modul.svg', title: 'Erfahrung aus 100+ PV-Anlagen', text: 'Praxis aus real umgesetzten Projekten – vom Einfamilienhaus bis zum Gewerbedach.' },
];

const reviewPlaceholders = [
  { initials: '—', name: 'Name aus Google-Bewertung', date: 'Datum aus Google-Bewertung', text: '„Rezensionstext aus dem Google Unternehmensprofil folgt.“' },
  { initials: '—', name: 'Name aus Google-Bewertung', date: 'Datum aus Google-Bewertung', text: '„Rezensionstext aus dem Google Unternehmensprofil folgt.“' },
  { initials: '—', name: 'Name aus Google-Bewertung', date: 'Datum aus Google-Bewertung', text: '„Rezensionstext aus dem Google Unternehmensprofil folgt.“' },
];

const gatewayCards = [
  { title: 'Produkte', headline: 'Komponenten, die zusammenpassen', text: 'Entdecken Sie Module, Wechselrichter, Speicher und Wallboxen, mit denen wir arbeiten.', cta: 'Produkte ansehen', image: '/assets/images/solar-module.png', href: '/produkte' },
  { title: 'Wissen', headline: 'PV einfach erklärt', text: 'Verstehen Sie Autarkie, Eigenverbrauch, Speicher, Wallbox und Wirtschaftlichkeit.', cta: 'Zum Wissensbereich', image: '/assets/images/solar-panel.jpeg', href: '/wissen' },
  { title: 'Über uns', headline: 'Hessisch, persönlich, regional', text: 'Lernen Sie LeBe, unsere Mission und unser Einsatzgebiet im Rhein-Main-Gebiet kennen.', cta: 'Mehr über LeBe', image: '/assets/images/hero-solar.jpeg', href: '/ueber-uns' },
];

const howWeWorkSteps = [
  { n: '1', title: 'Anfrage oder Paket auswählen', text: 'Sie wählen ein passendes Komplettpaket oder senden uns Ihre Anfrage.', cta: true },
  { n: '2', title: 'Beratung & technische Prüfung', text: 'Wir prüfen Dachfläche, Verbrauch, Zählerschrank, Speicherwunsch und technische Voraussetzungen.', cta: false },
  { n: '3', title: 'Planung & Produktauswahl', text: 'Sie erhalten eine passende Planung mit konkreten Komponenten und klaren Leistungen.', cta: false },
  { n: '4', title: 'Montage & Elektroinstallation', text: 'Die Anlage wird montiert, verkabelt und technisch eingebunden.', cta: false },
  { n: '5', title: 'Anmeldung & Inbetriebnahme', text: 'Wir begleiten die Anmeldung und erklären Ihnen Ihre Anlage nach der Inbetriebnahme.', cta: false },
];

const projectRefs = [
  { placeholder: 'Foto Einfamilienhaus Rödermark', location: 'Rödermark', title: 'Einfamilienhaus mit Speicher & Wallbox', kwp: '11,4 kWp', text: '24 Module, Fronius Reserva Speicher und Sungrow Wallbox – vollständig integriert in die Hausautomation.' },
  { placeholder: 'Foto Reihenmittelhaus Dietzenbach', location: 'Dietzenbach', title: 'Reihenmittelhaus, modular geplant', kwp: '7,6 kWp', text: 'Kompakte Anlage mit vorbereiteter Nachrüstung für Speicher und Wallbox.' },
  { placeholder: 'Foto Gewerbedach Rhein-Main', location: 'Rhein-Main-Gebiet', title: 'Gewerbedach für Produktionsbetrieb', kwp: '52,25 kWp', text: '110 Module auf einer Gewerbehalle, ausgelegt auf hohen Eigenverbrauch im Tagbetrieb.' },
];

const pillStyle: React.CSSProperties = {
  display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.20)',
  color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number,
};

function homePackages() {
  return offers.slice(0, 3).map((o) => {
    const sys = computeSystem(o.mainProducts);
    const priceDisplay = o.priceType === 'on_request' ? 'Auf Anfrage' : o.priceType === 'starting_from' ? 'ab ' + euro(o.priceAmount) : euro(o.priceAmount);
    return {
      offer: o,
      image: o.previewImageUrl,
      price: priceDisplay,
      badgeSafe: o.badge === 'Stromcloud möglich' ? 'Hohe Autarkie mit Speicherlösung' : o.badge,
      kwpLabel: sys.pvPowerKwp ? num(sys.pvPowerKwp, 1) + ' kWp' : '—',
      moduleLabel: sys.moduleCount ? sys.moduleCount + ' Module' : '—',
      storageLabel: sys.storageCapacityKwh ? num(sys.storageCapacityKwh, 1) + ' kWh Speicher' : 'ohne Speicher',
      mainMini: mainComponentsList(o).slice(0, 3),
    };
  });
}

function SimulatorTeaser() {
  const [consumption, setConsumption] = useState(6000);
  const [packageId, setPackageId] = useState(offers[0].id);

  const pkg = useMemo(() => offers.find((o) => o.id === packageId) || offers[0], [packageId]);
  const sys = useMemo(() => computeSystem(pkg.mainProducts), [pkg]);
  const calc = useMemo(() => compute(consumption, sys.pvPowerKwp || 0, sys.storageCapacityKwh || 0), [consumption, sys]);

  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '22px 24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <RangeSlider label="Jahresstromverbrauch" valueLabel={`${num(consumption)} kWh`} min={2000} max={15000} step={100} value={consumption} onChange={setConsumption} />
      <div>
        <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginBottom: 6 }}>Paket</div>
        <select
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-p6)', color: 'var(--charcoal)', background: 'var(--gray-300)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', outline: 'none' }}
        >
          {offers.map((o) => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={pillStyle}>{sys.pvPowerKwp ? num(sys.pvPowerKwp, 1) + ' kWp' : '—'}</span>
          <span style={pillStyle}>{sys.moduleCount ? sys.moduleCount + ' Module' : '—'}</span>
          <span style={pillStyle}>{sys.storageCapacityKwh ? num(sys.storageCapacityKwh, 1) + ' kWh Speicher' : 'ohne Speicher'}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, paddingTop: 6, borderTop: '1px solid var(--gray-400)' }}>
        <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Eigenverbrauch</div><div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{calc.eigenPct} %</div></div>
        <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Autarkiegrad</div><div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{calc.autarkPct} %</div></div>
        <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Ersparnis/Jahr</div><div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{euro(calc.totalBenefit)}</div></div>
      </div>
      <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontStyle: 'italic' }}>Voraussichtliche, unverbindliche Einschätzung</div>
    </div>
  );
}

export default function Home() {
  const packages = homePackages();

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      {/* 1 · HERO MIT VIDEO */}
      <section style={{ paddingTop: 64, background: 'var(--sage)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(34px, 4.2vw, var(--text-h1))', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', color: 'var(--yellow)', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            Die Sonne – unser Partner
          </h1>
        </div>

        <div className="lebe-hero-strip" style={{ position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', height: 'clamp(420px, 52vw, 640px)', marginTop: 36, overflow: 'hidden', background: 'var(--charcoal)' }}>
          <video className="lebe-hero-video-el" autoPlay muted loop playsInline preload="auto" poster="/assets/images/hero-solar.jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src="/assets/videos/intro.webm" type="video/webm" />
          </video>
          <img className="lebe-hero-poster-el" src="/assets/images/hero-solar.jpeg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,20,18,0.55) 0%, rgba(20,20,18,0.25) 42%, rgba(20,20,18,0) 65%)', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
              <div className="lebe-hero-card" style={{ maxWidth: 580, background: 'rgba(241,240,236,0.92)', backdropFilter: 'blur(6px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '40px 40px 36px' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', color: 'var(--charcoal)', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                  Photovoltaik-Komplettsysteme im Rhein-Main-Gebiet
                </h2>
                <p style={{ margin: '16px 0 0', fontSize: 'var(--text-p4)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
                  LeBe Solarenergie plant und installiert individuelle PV-Anlagen mit Speicher, Wallbox und moderner Energietechnik – persönlich, regional und von Beratung bis Anmeldung aus einer Hand.
                </p>
                <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <Link href="/kontakt?intent=freeConsultation"><Button variant="solid" tone="yellow" size="lg">Kostenlose Beratung anfragen</Button></Link>
                  <Link href="/angebote"><Button variant="outline" tone="ink" size="lg">Angebote ansehen</Button></Link>
                </div>
                <Link href="/pv-simulator" style={{ display: 'inline-block', marginTop: 16, fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', textDecoration: 'underline', cursor: 'pointer' }}>
                  PV-Anlage simulieren
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 60px' }}>
          <div className="lebe-hero-trust" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {heroTrustPoints.map((tp) => (
              <div key={tp} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-pill)', padding: '14px 18px', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>
                <span style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
                {tp}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 · TRUST STRIP */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px 8px' }}>
        <h2 style={{ margin: '0 0 26px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Warum LeBe-Solarenergie?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {landingTrustCards.map((tc) => (
            <div key={tc.title} style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(159,178,161,0.20)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={tc.icon} alt="" style={{ height: 26, width: 'auto' }} />
              </span>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{tc.title}</div>
              <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{tc.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 · AKTUELLE PV-KOMPLETTPAKETE */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 8, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Aktuelle PV-Komplettpakete</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 560, lineHeight: 'var(--lh-body)' }}>
              Vergleichen Sie transparente Pakete mit PV-Leistung, Speichergröße, konkreten Komponenten und klaren Inklusivleistungen.
            </p>
          </div>
          <Link href="/angebote" style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Alle Pakete vergleichen →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 26, marginTop: 24 }}>
          {packages.map((p) => (
            <div key={p.offer.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              <Link href={`/angebote/${p.offer.slug}`} style={{ position: 'relative', background: 'var(--sage)', aspectRatio: '16 / 10', overflow: 'hidden', cursor: 'pointer', display: 'block' }}>
                <img src={p.image} alt={p.offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {p.badgeSafe && (
                  <span style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                    {p.badgeSafe}
                  </span>
                )}
              </Link>
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <Link href={`/angebote/${p.offer.slug}`} style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)', cursor: 'pointer', display: 'block' }}>
                  {p.offer.title}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={pillStyle}>{p.kwpLabel}</span>
                  <span style={pillStyle}>{p.moduleLabel}</span>
                  <span style={pillStyle}>{p.storageLabel}</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{p.offer.subtitle}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {p.mainMini.map((m) => (
                    <div key={m.slotKey} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gray-300)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
                      <div style={{ width: 30, height: 22, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', borderRadius: 4, overflow: 'hidden' }}>
                        {m.hasLogo && <img src={m.logo} alt={m.manufacturer} style={{ maxWidth: 24, maxHeight: 16, objectFit: 'contain' }} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', lineHeight: 1.2 }}>{m.category}</div>
                        <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      </div>
                      <span style={{ flex: 'none', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', background: 'var(--yellow)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>
                        {m.qtyLabel.split('×')[0]}×
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Komplettpreis</div>
                    <div style={{ fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 1.1 }}>{p.price}</div>
                    <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 2 }}>Final nach technischer Prüfung</div>
                  </div>
                  <Link href={`/angebote/${p.offer.slug}`} style={{ cursor: 'pointer', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)' }}>
                    Details ansehen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · GOOGLE BEWERTUNGEN */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Das sagen unsere Kunden</h2>
        <p style={{ margin: '0 0 26px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 560, lineHeight: 'var(--lh-body)' }}>
          Erfahrungen aus echten PV-Projekten im Rhein-Main-Gebiet.
        </p>
        <div style={{ background: 'var(--cream)', border: '1px dashed var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em' }}>Google Bewertungen</div>
            <div style={{ color: 'var(--gray-500)', fontSize: 20, letterSpacing: 2 }}>☆☆☆☆☆</div>
            <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Google-Bewertungen werden dynamisch eingebunden.</div>
          </div>
          <Button variant="outline" tone="sage">Bewertungen auf Google ansehen</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {reviewPlaceholders.map((rv, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: 'var(--gray-500)', fontSize: 16, letterSpacing: 2 }}>☆☆☆☆☆</div>
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Google Bewertung</div>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', fontStyle: 'italic' }}>{rv.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(159,178,161,0.24)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{rv.initials}</span>
                <div>
                  <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{rv.name}</div>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{rv.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 · PV-SIMULATOR TEASER */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'var(--sage)', borderRadius: 'var(--radius-lg)', padding: 44, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p4)', color: 'var(--charcoal)', opacity: 0.7, fontWeight: 'var(--fw-semi)' as unknown as number }}>PV-Simulator</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)', color: 'var(--charcoal)' }}>
              Paket auswählen, Anlage anpassen und Unabhängigkeit berechnen
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 'var(--text-p4)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
              Starten Sie mit einem LeBe-Komplettpaket oder stellen Sie Ihre Anlage individuell zusammen. Jahresverbrauch, Modulanzahl, Speichergröße und optional die Adresse lassen sich frei anpassen – das Ergebnis zeigt eine unverbindliche Einschätzung zu Dachpotenzial, Eigenverbrauch und Autarkie.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/pv-simulator"><Button variant="solid" tone="ink" size="lg">PV-Anlage simulieren</Button></Link>
            </div>
          </div>
          <SimulatorTeaser />
        </div>
      </section>

      {/* 6 · PROZESS */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>So entsteht Ihre PV-Anlage</h2>
        <p style={{ margin: '0 0 30px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 620, lineHeight: 'var(--lh-body)' }}>
          Von der ersten Anfrage bis zur fertigen Anlage begleiten wir Ihr Projekt in einem koordinierten Ablauf.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {howWeWorkSteps.map((s) => (
            <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p4)' }}>{s.n}</span>
              {s.cta ? (
                <Link href="/kontakt" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--white)', background: 'var(--charcoal)', borderRadius: 'var(--radius-pill)', padding: '10px 16px' }}>
                  {s.title} →
                </Link>
              ) : (
                <div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)' }}>{s.title}</div>
              )}
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 · PRODUKTE / WISSEN / ÜBER UNS */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {gatewayCards.map((g) => (
            <Link key={g.title} href={g.href} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '3 / 4', cursor: 'pointer', boxShadow: 'var(--shadow-card)', display: 'block' }}>
              <img src={g.image} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ alignSelf: 'flex-start', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', background: 'var(--yellow)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>{g.title}</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--white)', lineHeight: 'var(--lh-snug)' }}>{g.headline}</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'rgba(255,255,255,0.85)', lineHeight: 'var(--lh-body)' }}>{g.text}</p>
                <span style={{ marginTop: 6, fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--yellow)' }}>{g.cta} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8 · PROJEKT-EINBLICKE */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Projekt-Einblicke aus dem Rhein-Main-Gebiet</h3>
        <p style={{ margin: '0 0 28px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 560, lineHeight: 'var(--lh-body)' }}>Echte Anlagen. Echte Dächer. Echte Umsetzung.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 26 }}>
          {projectRefs.map((pr) => (
            <div key={pr.title} style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ aspectRatio: '4 / 3', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: 'var(--text-p6)', textAlign: 'center', padding: 16 }}>
                {pr.placeholder}
              </div>
              <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em' }}>Projekt-Einblick · {pr.location}</div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)' }}>{pr.title}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '2px 0 2px' }}>
                  <span style={{ display: 'inline-flex', padding: '4px 11px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.20)', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pr.kwp}</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{pr.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9 · FINAL CTA */}
      <section style={{ maxWidth: 1180, margin: '64px auto 90px', padding: '0 24px' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: '56px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--white)', maxWidth: 620 }}>Bereit für Ihre eigene PV-Anlage?</h2>
          <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--white)', opacity: 0.8, maxWidth: 560, lineHeight: 'var(--lh-body)' }}>
            Wir prüfen gemeinsam, welches PV-Paket zu Ihrem Dach, Ihrem Verbrauch und Ihrer technischen Situation passt.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <Link href="/kontakt"><Button variant="solid" tone="yellow" size="lg">PV-Paket unverbindlich prüfen lassen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="sage" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 'var(--text-p7)', color: 'var(--white)', opacity: 0.6 }}>Persönlich. Regional. Transparent.</p>
        </div>
      </section>
    </div>
  );
}
