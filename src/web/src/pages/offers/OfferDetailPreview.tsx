import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProductCard } from '../../components/ui/ProductCard';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, fmtDate } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import { estimateSelfConsumptionAndAutarky } from '../../lib/offerCalc';
import { mainComponentsList, displayPrice, priceTypeLabel } from './offerUtils';
import type { Offer, Product } from '../../types';

const FAQ = [
  { q: 'Wie läuft die Anfrage ab?', a: 'Nach Ihrer unverbindlichen Anfrage prüfen wir Dachfläche, Verbrauch, Zählerschrank und technische Voraussetzungen und melden uns persönlich zurück.' },
  { q: 'Ist der Preis final?', a: 'Der Preis basiert auf den im Angebot beschriebenen Komponenten und Leistungen. Zusatzarbeiten werden vorab transparent besprochen und separat angeboten.' },
  { q: 'Kann ich das Paket anpassen?', a: 'Je nach Angebot können Komponenten wie Speicher oder Wallbox angepasst werden. Wir besprechen das gerne im persönlichen Gespräch.' },
  { q: 'Was passiert nach der Installation?', a: 'Wir übernehmen die Anmeldung beim Netzbetreiber, die Inbetriebnahme sowie eine persönliche Einweisung in Ihre Anlage.' },
];

const PROCESS_STEPS = [
  { title: 'Anfrage', text: 'Sie senden uns Ihre unverbindliche Anfrage zu diesem Paket.' },
  { title: 'Beratung & technische Prüfung', text: 'Wir prüfen Dachfläche, Verbrauch, Zählerschrank und technische Voraussetzungen.' },
  { title: 'Planung & Produktauswahl', text: 'Sie erhalten eine passende Planung mit konkreten Komponenten und klaren Leistungen.' },
  { title: 'Montage & Elektroinstallation', text: 'Die Anlage wird montiert, verkabelt und technisch eingebunden.' },
  { title: 'Anmeldung & Inbetriebnahme', text: 'Wir begleiten die Anmeldung und erklären Ihnen Ihre Anlage nach der Inbetriebnahme.' },
];

function DoughnutCard({ label, valuePct, canvasId, color }: { label: string; valuePct: number; canvasId: string; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { datasets: [{ data: [valuePct, 100 - valuePct], backgroundColor: [color, '#ebebeb'], borderWidth: 0 }] },
      options: { cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { duration: 400 } },
    });
    return () => { chartRef.current?.destroy(); };
  }, [valuePct, color]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
        <canvas id={canvasId} ref={ref} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--charcoal)' }}>{Math.round(valuePct)}%</div>
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>{label}</div>
    </div>
  );
}

export default function OfferDetailPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [consumption, setConsumption] = useState(4500);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([offersApi.get(id), productsApi.list()]).then(([o, p]) => {
      setOffer(o);
      setProducts(p);
      setConsumption(o.economics.annualConsumptionKwh || 4500);
    }).finally(() => setLoading(false));
  }, [id]);

  const productsById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);
  const sys = offer?.calculatedSystem;

  const { selfConsumptionRate, autarkyRate } = useMemo(() => {
    if (!sys?.pvPowerKwp) return { selfConsumptionRate: 0, autarkyRate: 0 };
    return estimateSelfConsumptionAndAutarky(sys.pvPowerKwp, sys.storageCapacityKwh || 0, consumption, offer?.economics.specificYieldKwhPerKwp || 950);
  }, [sys, consumption, offer]);

  const savingsPct = useMemo(() => {
    if (!offer || !sys?.pvPowerKwp) return 0;
    const electricityPrice = (offer.economics.electricityPriceCentPerKwh || 35) / 100;
    const feedInTariff = (offer.economics.feedInTariffCentPerKwh || 7.9) / 100;
    const annualYield = sys.pvPowerKwp * (offer.economics.specificYieldKwhPerKwp || 950);
    const selfUsed = annualYield * selfConsumptionRate;
    const fedIn = annualYield - selfUsed;
    const totalBenefit = selfUsed * electricityPrice + fedIn * feedInTariff;
    const costWithoutPv = consumption * electricityPrice;
    return costWithoutPv > 0 ? Math.min(100, (totalBenefit / costWithoutPv) * 100) : 0;
  }, [offer, sys, consumption, selfConsumptionRate]);

  if (loading || !offer) {
    return (
      <div>
        <Topbar title="Angebot-Vorschau" mobile={mobile} onMenu={onMenu} />
        <Card style={{ height: 300, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      </div>
    );
  }

  const mainMini = mainComponentsList(offer, productsById);
  const techComponents = offer.systemComponents.filter(c => c.visibility !== 'hidden');
  const publicServices = offer.includedServices.filter(s => s.visibility !== 'hidden');
  const requirements = offer.requirementsAndExclusions.filter(r => r.type === 'requirement');
  const optionalWork = offer.requirementsAndExclusions.filter(r => r.type === 'optionalAdditionalWork');
  const notify = () => pushToast('info', 'In der Vorschau werden keine echten Anfragen gesendet.');

  return (
    <div>
      <Topbar title="Angebot-Vorschau" subtitle={`So sieht dieses Angebot für Kund:innen aus · ${offer.id}`} mobile={mobile} onMenu={onMenu}
        action={<div style={{ display: 'flex', gap: 8 }}>
          <AdminButton variant="outline" icon="edit" onClick={() => navigate(`/offers/${offer.id}/edit`)}>Bearbeiten</AdminButton>
          <AdminButton variant="ghost" icon="x" onClick={() => navigate('/offers')}>Schließen</AdminButton>
        </div>} />

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-raised)', overflow: 'hidden' }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: w < 700 ? 220 : 340, background: 'var(--sage)' }}>
          {offer.previewImageUrl
            ? <img src={offer.previewImageUrl} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={44} color="rgba(255,255,255,0.7)" /></div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(60,60,59,0.65), rgba(60,60,59,0))' }} />
          <div style={{ position: 'absolute', left: w < 700 ? 20 : 44, right: w < 700 ? 20 : 44, bottom: 24, color: '#fff' }}>
            <h1 style={{ margin: 0, fontSize: w < 700 ? 26 : 38, fontWeight: 700, lineHeight: 1.1 }}>{offer.title}</h1>
            <p style={{ margin: '8px 0 0', fontSize: w < 700 ? 15 : 18, color: '#f1f0ec' }}>{offer.subtitle}</p>
          </div>
        </div>

        <div style={{ padding: w < 700 ? '22px 20px' : '32px 44px' }}>
          {/* Key facts + price + CTA */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {sys?.pvPowerKwp != null && <KeyFact label="PV-Leistung" value={`${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp`} />}
            {sys && sys.moduleCount > 0 && <KeyFact label="Module" value={`${sys.moduleCount}`} />}
            {sys?.storageCapacityKwh != null && <KeyFact label="Speicher" value={`${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh`} />}
            {offer.mainProducts.wallbox && <KeyFact label="Wallbox" value="inklusive" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid var(--gray-400)', paddingBottom: 22, marginBottom: 26 }}>
            <div>
              <div style={{ fontSize: w < 700 ? 26 : 32, fontWeight: 700, color: 'var(--charcoal)' }}>{displayPrice(offer)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', marginTop: 4 }}>{priceTypeLabel(offer.priceType)}{offer.validUntil ? ` · gültig bis ${fmtDate(offer.validUntil)}` : ''}{offer.priceType !== 'fixed' ? ' · Final nach Dachprüfung und technischer Prüfung.' : ''}</div>
              {offer.taxNote && <div style={{ fontSize: 12, color: 'var(--gray-mid)', marginTop: 2 }}>{offer.taxNote}</div>}
            </div>
            <AdminButton variant="primary" icon="send" onClick={notify}>Paket unverbindlich anfragen</AdminButton>
          </div>

          {/* USP banner */}
          <div style={{ textAlign: 'center', background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 30, fontSize: 16, fontWeight: 700, color: 'var(--charcoal)' }}>
            Alles drin. Alles transparent. Alles aus regionaler Hand.
          </div>

          {/* Systemübersicht */}
          <SectionHeading>Systemübersicht</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 32 }}>
            <ReadStat label="PV-Leistung" value={sys?.pvPowerKwp != null ? `${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWp` : '—'} />
            <ReadStat label="Modulanzahl" value={sys && sys.moduleCount > 0 ? `${sys.moduleCount}` : '—'} />
            <ReadStat label="Modulfläche" value={sys?.moduleAreaM2 != null ? `${sys.moduleAreaM2.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²` : '—'} />
            <ReadStat label="Speichergröße" value={sys?.storageCapacityKwh != null ? `${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWh` : '—'} />
            <ReadStat label="Wechselrichterleistung" value={sys?.inverterPowerKw != null ? `${sys.inverterPowerKw.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kW` : '—'} />
          </div>

          {/* Hauptkomponenten */}
          {mainMini.length > 0 && (
            <>
              <SectionHeading>Hauptkomponenten</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
                {mainMini.map(({ slot, product, quantity }) => <ProductCard key={slot.key} product={product} quantity={quantity} />)}
              </div>
            </>
          )}

          {/* Technik & Zubehör inklusive */}
          {techComponents.length > 0 && (
            <>
              <SectionHeading>Technik &amp; Zubehör inklusive</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 32 }}>
                {techComponents.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="layers" size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>{c.publicLabel || c.name}</div>
                      {c.publicDescription && <div style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{c.publicDescription}</div>}
                    </div>
                    {!c.included && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-mid)', flex: 'none' }}>optional</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Leistungen inklusive */}
          {publicServices.length > 0 && (
            <>
              <SectionHeading>Leistungen inklusive</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {publicServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(31,138,91,0.14)', color: '#1f8a5b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: 2 }}><Icon name="check" size={15} /></span>
                    <div>
                      <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--charcoal)' }}>{s.name}{s.quantity > 1 ? ` (${s.quantity}×)` : ''}</div>
                      {s.descriptionLines.filter(l => l.trim()).map((l, j) => <div key={j} style={{ fontSize: 13.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Voraussetzungen & Zusatzarbeiten */}
          {(requirements.length > 0 || optionalWork.length > 0) && (
            <>
              <SectionHeading>Voraussetzungen &amp; mögliche Zusatzarbeiten</SectionHeading>
              <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--charcoal)', background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>Falls Zusatzarbeiten notwendig sind, werden diese vorab transparent besprochen und separat angeboten.</p>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Voraussetzungen</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {requirements.map(r => <li key={r.id} style={{ fontSize: 13.5, color: 'var(--charcoal)' }}><strong>{r.title}</strong>{r.description ? ` — ${r.description}` : ''}</li>)}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Mögliche Zusatzarbeiten nach Prüfung</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {optionalWork.map(r => <li key={r.id} style={{ fontSize: 13.5, color: 'var(--charcoal)' }}><strong>{r.title}</strong>{r.description ? ` — ${r.description}` : ''}</li>)}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Wirtschaftlichkeit */}
          {offer.economics.enabled && sys?.pvPowerKwp != null && (
            <>
              <SectionHeading>Ihre Wirtschaftlichkeit</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <Field label={`Jahresstromverbrauch: ${consumption.toLocaleString('de-DE')} kWh`}>
                    <input type="range" min={1500} max={12000} step={100} value={consumption} onChange={e => setConsumption(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--sage)' }} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                    <ReadStat label="PV-Leistung (Paket)" value={`${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp`} />
                    <ReadStat label="Speicher (Paket)" value={sys.storageCapacityKwh != null ? `${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh` : 'kein Speicher'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, minWidth: 0, alignItems: 'center' }}>
                  <DoughnutCard label="Eigenverbrauchsanteil" valuePct={selfConsumptionRate * 100} canvasId={`sc-${offer.id}`} color="#9fb2a1" />
                  <DoughnutCard label="Autarkiegrad" valuePct={autarkyRate * 100} canvasId={`au-${offer.id}`} color="#ffed00" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 150, height: 150, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', flexDirection: 'column' }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--charcoal)' }}>{Math.round(savingsPct)}%</div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>Ersparnis ggü. Netzbezug</div>
                  </div>
                </div>
              </div>
              <p style={{ margin: '0 0 32px', fontSize: 12, color: 'var(--gray-mid)', lineHeight: 1.5, background: 'var(--gray-300)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>{offer.economics.disclaimer}</p>
            </>
          )}

          {/* Ablauf */}
          <SectionHeading>Ablauf nach Ihrer Anfrage</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {PROCESS_STEPS.map((s, i) => (
              <div key={i}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{s.text}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <SectionHeading>Häufige Fragen</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: 'var(--white)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)' }}>
                  {f.q}<Icon name={openFaq === i ? 'x' : 'plus'} size={15} />
                </button>
                {openFaq === i && <div style={{ padding: '0 14px 14px', fontSize: 13.5, color: 'var(--gray-mid)', lineHeight: 1.55 }}>{f.a}</div>}
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: 'center', background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: '30px 24px' }}>
            <div style={{ color: 'var(--yellow)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Interesse an diesem Paket?</div>
            <p style={{ color: '#e9e9e7', fontSize: 13.5, margin: '0 0 18px' }}>Unverbindlich. Persönlich. Transparent.</p>
            <AdminButton variant="accent" icon="send" onClick={notify}>Paket unverbindlich anfragen</AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: 'var(--charcoal)' }}>{children}</h2>;
}
function KeyFact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--cream)', display: 'flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>{value}</span>
      <span style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>{label}</span>
    </div>
  );
}
function ReadStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--gray-300)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>{label}</span>
      {children}
    </label>
  );
}
