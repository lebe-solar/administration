'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { offers } from '@/lib/mockData';
import { computeSystem, euro, mainComponentsList, servicesList } from '@/lib/offerCalc';

type Target = 'alle' | 'privat' | 'unternehmen';

const targets: { key: Target; label: string }[] = [
  { key: 'alle', label: 'Alle Pakete' },
  { key: 'privat', label: 'Privathaushalte' },
  { key: 'unternehmen', label: 'Unternehmen' },
];

const inklusiveCards = [
  { icon: '💬', title: 'Persönliche Beratung', text: 'Wir besprechen vor Ort oder digital, welche Anlage zu Ihrem Dach, Ihrem Verbrauch und Ihren Zielen passt.' },
  { icon: '📏', title: 'Planung & Auslegung', text: 'Wir prüfen Dachfläche, Verbrauch, Autarkiewunsch und technische Voraussetzungen für eine passende Anlagenplanung.' },
  { icon: '🚚', title: 'Lieferung & Montage', text: 'Die Komponenten werden geliefert und fachgerecht auf Ihrer Dachfläche montiert.' },
  { icon: '⚡', title: 'Elektroinstallation & Verkabelung', text: 'Wechselrichter, Speicher, Zählerschrank-Anbindung und notwendige Verkabelung werden in die technische Planung einbezogen.' },
  { icon: '✅', title: 'Anmeldung & Inbetriebnahme', text: 'Wir unterstützen bei der Anmeldung der PV-Anlage und begleiten die Inbetriebnahme.' },
  { icon: '📖', title: 'Einweisung & Betreuung', text: 'Nach der Umsetzung erklären wir Ihnen die Anlage, das Monitoring und die nächsten Schritte.' },
];

const companySteps = [
  { n: '1', title: 'Paket auswählen oder Anfrage senden', text: 'Wählen Sie ein passendes Komplettpaket oder senden Sie uns eine individuelle Anfrage. Wir prüfen anschließend, ob das Paket zu Ihrem Haus und Ihren technischen Voraussetzungen passt.' },
  { n: '2', title: 'Persönliche Beratung & Vor-Ort-Prüfung', text: 'Wir besprechen Dachfläche, Stromverbrauch, Speicherwunsch, Wallbox, Zählerschrank und Ihre Ziele für Eigenverbrauch und Autarkie.' },
  { n: '3', title: 'Individuelle Planung', text: 'Auf Basis Ihrer Angaben und der technischen Prüfung erstellen wir eine passende Planung mit Komponenten, Leistung, Speichergröße und Wirtschaftlichkeitsbetrachtung.' },
  { n: '4', title: 'Produktauswahl & transparentes Angebot', text: 'Sie sehen klar, welche Module, Wechselrichter, Speicher oder Zusatzkomponenten verbaut werden und welche Leistungen im Angebot enthalten sind.' },
  { n: '5', title: 'Lieferung, Montage, Anmeldung & Inbetriebnahme', text: 'Von der Lieferung über die Montage und Elektroinstallation bis zur Anmeldung der PV-Anlage beim Netzbetreiber und Inbetriebnahme begleiten wir Ihr Projekt in einem koordinierten Ablauf.' },
];

const pageRequirements = ['Geeignete Dachfläche', 'Technisch passender Zählerschrank', 'Zugang zu Dach und Technikraum', 'Internetverbindung für Monitoring', 'Technische Prüfung vor Umsetzung'];
const pageOptionalWork = ['Zählerschrank-Erneuerung', 'Sondergerüst', 'Lange Kabelwege', 'Dacharbeiten', 'Zusätzliche Kernbohrungen', 'Netzanschlussanpassungen'];

const angeboteFaqData = [
  { q: 'Ist die Anfrage verbindlich?', a: 'Nein. Ihre Anfrage ist unverbindlich – wir prüfen zunächst, ob das gewählte Paket zu Ihrem Haus passt, bevor ein Angebot verbindlich wird.' },
  { q: 'Ist der Preis ein Festpreis?', a: 'Die genannten Preise gelten für die beschriebene Standardausstattung. Weichen die Voraussetzungen vor Ort ab, besprechen wir eventuelle Anpassungen vorab transparent mit Ihnen.' },
  { q: 'Was passiert, wenn mein Zählerschrank erneuert werden muss?', a: 'Das klären wir bei der technischen Prüfung. Eine Erneuerung ist nicht im Paketpreis enthalten und wird bei Bedarf separat angeboten.' },
  { q: 'Ist die Anmeldung der PV-Anlage enthalten?', a: 'Ja. Wir unterstützen Sie bei der Anmeldung Ihrer Anlage beim zuständigen Netzbetreiber und begleiten die Inbetriebnahme.' },
  { q: 'Kann ich Speicher oder Wallbox ergänzen?', a: 'Bei mehreren Paketen sind Speicher und Wallbox jederzeit nachrüstbar. Sprechen Sie uns gerne auf die passende Option für Ihr Paket an.' },
  { q: 'Wie läuft die Vor-Ort-Prüfung ab?', a: 'Wir sehen uns Dachfläche, Zählerschrank und Zugangswege an und besprechen Ihren Stromverbrauch sowie Ihre Ziele für Eigenverbrauch und Autarkie.' },
];

const pillStyle: React.CSSProperties = {
  display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.20)',
  color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number,
};

function enrichOffers() {
  return offers.map((o) => {
    const sys = computeSystem(o.mainProducts);
    const priceDisplay = o.priceType === 'on_request' ? 'Auf Anfrage' : o.priceType === 'starting_from' ? 'ab ' + euro(o.priceAmount) : euro(o.priceAmount);
    return {
      offer: o,
      target: (o.id === 'ANG-2026-030' ? 'unternehmen' : 'privat') as Target,
      kwpLabel: sys.pvPowerKwp ? `${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp` : '—',
      moduleLabel: sys.moduleCount ? sys.moduleCount + ' Module' : '—',
      storageLabel: sys.storageCapacityKwh ? `${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh Speicher` : 'ohne Speicher',
      hasWallbox: !!o.mainProducts.wallbox,
      price: priceDisplay,
      mainMini: mainComponentsList(o).slice(0, 3),
      topInclusive: servicesList(o).slice(0, 3).map((s) => s.name),
    };
  });
}

export default function AngebotePage() {
  const [target, setTarget] = useState<Target>('alle');
  const enriched = useMemo(() => enrichOffers(), []);
  const filtered = target === 'alle' ? enriched : enriched.filter((o) => o.target === target);

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      {/* 1 · HERO */}
      <section style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 40px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Alles drin. Alles transparent. Alles aus regionaler Hand.</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', maxWidth: 780, textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            Solaranlagen-Komplettpakete für Zuhause und Unternehmen
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 'var(--text-p3)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', maxWidth: 660 }}>
            Vergleichen Sie transparente PV-Angebote mit konkreten Komponenten, klaren Inklusivleistungen und persönlicher Umsetzung durch LeBe-Solarenergie im Rhein-Main-Gebiet.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
            <Link href="/kontakt"><Button variant="solid" tone="ink" size="lg">PV-Paket unverbindlich prüfen lassen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="ink" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span style={pillStyle}>Regional im Rhein-Main-Gebiet</span>
            <span style={pillStyle}>Persönliche Beratung</span>
            <span style={pillStyle}>Alles aus einer Hand</span>
            <span style={pillStyle}>Transparente Komponenten</span>
          </div>
        </div>
      </section>

      {/* 2 · FILTER + 3 · GRID */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Unsere aktuellen PV-Komplettpakete</h2>
          <div style={{ display: 'flex', gap: 8, background: 'var(--cream)', padding: 6, borderRadius: 'var(--radius-pill)' }}>
            {targets.map((t) => (
              <span
                key={t.key}
                onClick={() => setTarget(t.key)}
                style={{
                  cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-p6)',
                  fontWeight: 'var(--fw-semi)' as unknown as number, transition: 'background .15s',
                  background: target === t.key ? 'var(--white)' : 'transparent',
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 26 }}>
          {filtered.map((o) => (
            <div key={o.offer.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ position: 'relative', background: 'var(--sage)', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                <img src={o.offer.previewImageUrl} alt={o.offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {o.offer.badge && (
                  <span style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                    {o.offer.badge}
                  </span>
                )}
              </div>
              <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)' }}>{o.offer.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={pillStyle}>{o.kwpLabel}</span>
                  <span style={pillStyle}>{o.moduleLabel}</span>
                  <span style={pillStyle}>{o.storageLabel}</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{o.offer.subtitle}</p>

                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Verbaut im Paket</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {o.mainMini.map((m) => (
                      <div key={m.slotKey} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gray-300)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
                        <div style={{ width: 34, height: 24, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', borderRadius: 4, overflow: 'hidden' }}>
                          {m.hasLogo && <img src={m.logo} alt={m.manufacturer} style={{ maxWidth: 28, maxHeight: 18, objectFit: 'contain' }} />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', lineHeight: 1.2 }}>{m.category}</div>
                          <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                        </div>
                        <span style={{ flex: 'none', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', background: 'var(--yellow)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>{m.qtyLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Wichtigste Inklusivleistungen</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {o.topInclusive.map((ti) => (
                      <div key={ti} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 'var(--text-p6)', color: 'var(--charcoal)' }}>
                        <span style={{ color: 'var(--sage)', flex: 'none' }}>✓</span><span>{ti}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Komplettpreis</div>
                    <div style={{ fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 1.1 }}>{o.price}</div>
                    <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 2 }}>Final nach technischer Prüfung</div>
                  </div>
                  <Link href={`/angebote/${o.offer.slug}`} style={{ cursor: 'pointer', textAlign: 'right', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)' }}>
                    Details ansehen
                  </Link>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Link href={`/kontakt?intent=offerPackage&offer=${o.offer.slug}`}>
                    <Button variant="solid" tone="ink" style={{ width: '100%' }}>Paket unverbindlich prüfen lassen</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · VERGLEICH */}
      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px', overflowX: 'auto' }}>
        <h2 style={{ margin: '0 0 22px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Pakete im Vergleich</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--charcoal)' }}>
              {['Paket', 'PV-Leistung', 'Speicher', 'Wallbox', 'Für wen geeignet', 'Preis', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.offer.id} style={{ borderBottom: '1px solid var(--gray-500)' }}>
                <td style={{ padding: 14, fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{o.offer.title}</td>
                <td style={{ padding: 14, fontSize: 'var(--text-p5)' }}>{o.kwpLabel}</td>
                <td style={{ padding: 14, fontSize: 'var(--text-p5)' }}>{o.storageLabel}</td>
                <td style={{ padding: 14, fontSize: 'var(--text-p5)' }}>
                  {o.hasWallbox ? <span style={{ color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>✓ inklusive</span> : <span style={{ color: 'var(--gray-mid)' }}>nachrüstbar</span>}
                </td>
                <td style={{ padding: 14, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', maxWidth: 220 }}>{o.offer.designedFor}</td>
                <td style={{ padding: 14, fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{o.price}</td>
                <td style={{ padding: 14 }}>
                  <Link href={`/angebote/${o.offer.slug}`} style={{ cursor: 'pointer', display: 'inline-flex', padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--charcoal)', color: 'var(--cream)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, whiteSpace: 'nowrap' }}>
                    Details ansehen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: '10px 0 0', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Preise final nach technischer Prüfung. Für Detailkomponenten und Voraussetzungen siehe Angebotsdetail.</p>
        <div style={{ marginTop: 18 }}>
          <Link href="/kontakt"><Button variant="outline" tone="ink">Paket unverbindlich prüfen lassen</Button></Link>
        </div>
      </section>

      {/* 5 · BEI LEBE IMMER INKLUSIVE */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px 0' }}>
        <h2 style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Bei LeBe immer inklusive</h2>
        <p style={{ margin: '0 0 36px', textAlign: 'center', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)' }}>Ein koordinierter Ablauf mit LeBe als persönlichem Ansprechpartner – keine anonyme Vermittlung.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {inklusiveCards.map((c) => (
            <div key={c.title} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 26 }}>{c.icon}</span>
              <h3 style={{ margin: 0, fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{c.title}</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · FÜNF SCHRITTE */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px 0' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>In fünf Schritten zur fertigen PV-Anlage</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {companySteps.map((c) => (
            <div key={c.n} style={{ display: 'flex', gap: 20, padding: '22px 0', borderBottom: '1px solid var(--gray-400)' }}>
              <span style={{ flex: 'none', display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number }}>{c.n}</span>
              <div>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', maxWidth: 700 }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 · VORAUSSETZUNGEN & ZUSATZARBEITEN */}
      <section style={{ maxWidth: 1180, margin: '72px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Voraussetzungen &amp; mögliche Zusatzarbeiten</h2>
        <p style={{ margin: '0 0 26px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 700, lineHeight: 'var(--lh-body)' }}>
          Damit Ihr Angebot fair und nachvollziehbar bleibt, zeigen wir klar, was im Paket enthalten ist und welche Arbeiten erst nach technischer Prüfung relevant werden können.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div style={{ background: 'rgba(159,178,161,0.14)', border: '1px solid var(--sage)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Typische Voraussetzungen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pageRequirements.map((r) => (
                <div key={r} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 'var(--text-p5)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Mögliche Zusatzarbeiten nach Prüfung</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pageOptionalWork.map((w) => (
                <div key={w} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--gray-500)', color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>+</span>
                  <span style={{ fontSize: 'var(--text-p5)' }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ margin: '20px 0 0', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Falls Zusatzarbeiten notwendig sind, werden diese vorab transparent besprochen und separat angeboten.</p>
      </section>

      {/* 8 · FAQ */}
      <section style={{ maxWidth: 820, margin: '72px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 22px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Häufige Fragen</h2>
        <Accordion items={angeboteFaqData} />
      </section>

      {/* 9 · FINAL CTA */}
      <section style={{ maxWidth: 1180, margin: '72px auto 80px', padding: '0 24px' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: '56px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--cream)', maxWidth: 620 }}>Unsicher, welches Paket passt?</h2>
          <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--gray-mid)', maxWidth: 560, lineHeight: 'var(--lh-body)' }}>
            Wir prüfen gemeinsam, welches PV-Paket zu Ihrem Dach, Ihrem Verbrauch und Ihrer technischen Situation passt.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <Link href="/kontakt"><Button variant="solid" tone="yellow" size="lg">PV-Paket unverbindlich prüfen lassen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="sage" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
