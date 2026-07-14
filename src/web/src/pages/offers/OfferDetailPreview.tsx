import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProductCard } from '../../components/ui/ProductCard';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, fmtDate, euro } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import { estimateSelfConsumptionAndAutarky } from '../../lib/offerCalc';
import { mainComponentsList, displayPrice, priceTypeLabel, computeEconomics } from './offerUtils';
import type { Offer, Product, OfferRequirement } from '../../types';

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

const OPTIONAL_WORK_PRICE_LABEL: Record<OfferRequirement['priceType'], (p?: number | null) => string> = {
  included: () => 'inklusive',
  onRequest: () => 'auf Anfrage',
  fixed: p => (p != null ? euro(p) : 'Festpreis'),
  startingFrom: p => (p != null ? `ab ${euro(p)}` : 'ab Preis'),
};

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
    <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
      <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto' }}>
        <canvas id={canvasId} ref={ref} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--charcoal)' }}>{Math.round(valuePct)}%</div>
      </div>
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

  const yearlyBenefit = useMemo(() => {
    if (!offer || !sys) return null;
    return computeEconomics(sys.pvPowerKwp, { ...offer.economics, annualConsumptionKwh: consumption }, offer.priceAmount);
  }, [offer, sys, consumption]);

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

  const keyFacts: string[] = [];
  if (sys && sys.moduleCount > 0) keyFacts.push(`${sys.moduleCount} Module`);
  if (sys?.pvPowerKwp != null) keyFacts.push(`${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp`);
  if (sys?.storageCapacityKwh != null) keyFacts.push(`${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh Speicher`);
  if (offer.mainProducts.wallbox) keyFacts.push('Wallbox inkl.');

  const systemStats: { value: string; label: string }[] = [];
  if (sys?.pvPowerKwp != null) systemStats.push({ value: `${sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp`, label: 'PV-Leistung' });
  if (sys && sys.moduleCount > 0) systemStats.push({ value: String(sys.moduleCount), label: 'Solarmodule' });
  if (sys?.moduleAreaM2 != null) systemStats.push({ value: `${sys.moduleAreaM2.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²`, label: 'Modulfläche' });
  if (sys?.storageCapacityKwh != null) systemStats.push({ value: `${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh`, label: 'Speicher' });
  if (sys?.inverterPowerKw != null) systemStats.push({ value: `${sys.inverterPowerKw.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kW`, label: 'Wechselrichter' });
  if (sys?.wallboxPowerKw != null) systemStats.push({ value: `${sys.wallboxPowerKw.toLocaleString('de-DE', { maximumFractionDigits: 0 })} kW`, label: 'Wallbox' });

  const two = w >= 900;

  return (
    <div>
      <Topbar title="Angebot-Vorschau" subtitle={`So sieht dieses Angebot für Kund:innen aus · ${offer.id}`} mobile={mobile} onMenu={onMenu}
        action={<div style={{ display: 'flex', gap: 8 }}>
          <AdminButton variant="outline" icon="edit" onClick={() => navigate(`/offers/${offer.id}/edit`)}>Bearbeiten</AdminButton>
          <AdminButton variant="ghost" icon="x" onClick={() => navigate('/offers')}>Schließen</AdminButton>
        </div>} />

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-raised)', overflow: 'hidden' }}>
        <div style={{ padding: w < 700 ? '22px 20px 0' : '28px 44px 0' }}>
          {/* Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: 44, alignItems: 'center', marginBottom: 48 }}>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--sage)', boxShadow: 'var(--shadow-card)', aspectRatio: '4 / 3' }}>
              {offer.previewImageUrl
                ? <img src={offer.previewImageUrl} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={44} color="rgba(255,255,255,0.7)" /></div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h1 style={{ margin: 0, fontSize: w < 700 ? 26 : 32, fontWeight: 700, lineHeight: 1.15 }}>{offer.title}</h1>
              <p style={{ margin: 0, fontSize: 17, color: 'var(--sage)', fontWeight: 700, lineHeight: 1.3 }}>{offer.subtitle}</p>
              {keyFacts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {keyFacts.map(k => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 13px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.20)', fontSize: 12.5, fontWeight: 700 }}>{k}</span>)}
                </div>
              )}
              {offer.designedFor && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <span style={{ color: 'var(--sage)', fontSize: 18, lineHeight: 1.4 }}>✓</span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{offer.designedFor}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 4, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--gray-mid)' }}>{priceTypeLabel(offer.priceType)}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.05 }}>{displayPrice(offer)}</div>
                </div>
                {offer.validUntil && <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', paddingBottom: 6 }}>Gültig bis {fmtDate(offer.validUntil)}</div>}
              </div>
              {offer.taxNote && <div style={{ fontSize: 12, color: 'var(--gray-mid)', marginTop: -8 }}>{offer.taxNote}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <AdminButton variant="primary" icon="send" onClick={notify}>Paket unverbindlich anfragen</AdminButton>
                <AdminButton variant="outline" icon="file" onClick={notify}>Als PDF</AdminButton>
              </div>
            </div>
          </div>
        </div>

        {/* USP banner */}
        <div style={{ background: 'var(--charcoal)', textAlign: 'center', padding: '30px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--yellow)' }}>Alles drin. Alles transparent. Alles aus regionaler Hand.</h2>
        </div>

        <div style={{ padding: w < 700 ? '0 20px 22px' : '0 44px 32px' }}>
          {/* Wirtschaftlichkeit */}
          {offer.economics.enabled && sys?.pvPowerKwp != null && (
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '32px 34px 36px', marginTop: 52, marginBottom: 32 }}>
              <p style={{ margin: '0 0 6px', fontSize: 15, color: 'var(--sage)', fontWeight: 700 }}>Ihre Wirtschaftlichkeit</p>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Ihre Ersparnis auf einen Blick</h2>
              <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--gray-mid)', maxWidth: 640, lineHeight: 1.5 }}>Stellen Sie Ihren Stromverbrauch ein – PV-Leistung und Speichergröße stammen aus diesem Paket.</p>
              <div style={{ display: 'grid', gridTemplateColumns: two ? '300px 1fr' : '1fr', gap: 28, alignItems: 'start' }}>
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Stromverbrauch</span>
                      <span style={{ fontSize: 13.5, color: 'var(--sage)', fontWeight: 700 }}>{consumption.toLocaleString('de-DE')} kWh</span>
                    </div>
                    <input type="range" min={2000} max={15000} step={100} value={consumption} onChange={e => setConsumption(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--sage)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>PV-Leistung</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{sys.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWp</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Speicher</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{sys.storageCapacityKwh != null ? `${sys.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kWh` : 'kein Speicher'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: -8 }}>aus diesem Paket</div>
                  {yearlyBenefit?.estimatedTotalBenefitPerYear != null && (
                    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
                      <div style={{ fontSize: 12.5, color: 'var(--gray-mid)' }}>Gesamtvorteil pro Jahr</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.1 }}>{euro(yearlyBenefit.estimatedTotalBenefitPerYear)}</div>
                      <div style={{ display: 'flex', gap: 22, marginTop: 12 }}>
                        <div><div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Einsparung</div><div style={{ fontSize: 14, fontWeight: 700 }}>{euro(yearlyBenefit.estimatedSavingsPerYear)}</div></div>
                        <div><div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>Einspeisung</div><div style={{ fontSize: 14, fontWeight: 700 }}>{euro(yearlyBenefit.estimatedFeedInRevenuePerYear)}</div></div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: w < 560 ? '1fr' : 'repeat(3, 1fr)', gap: 18 }}>
                  <DoughnutCard label="Eigenverbrauchsanteil" valuePct={selfConsumptionRate * 100} canvasId={`sc-${offer.id}`} color="#9fb2a1" />
                  <DoughnutCard label="Autarkiegrad" valuePct={autarkyRate * 100} canvasId={`au-${offer.id}`} color="#3c3c3b" />
                  <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', fontWeight: 700, marginBottom: 10 }}>Ersparnis ggü. Netzbezug</div>
                    <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--sage)', lineHeight: 1 }}>{Math.round(savingsPct)}%</div>
                  </div>
                </div>
              </div>
              <p style={{ margin: '22px 0 0', fontSize: 11, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{offer.economics.disclaimer}</p>
            </div>
          )}

          {/* Systemübersicht */}
          {systemStats.length > 0 && (
            <>
              <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Ihre Anlage im Überblick</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 48 }}>
                {systemStats.map(s => (
                  <div key={s.label} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '18px 16px' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.05 }}>{s.value}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Hauptkomponenten */}
          {mainMini.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <SectionHeading n={1}>Hauptkomponenten</SectionHeading>
              <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--gray-mid)', paddingLeft: 42 }}>Die zentralen Markenprodukte Ihrer Anlage.</p>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {mainMini.map(({ slot, product, quantity }) => <ProductCard key={slot.key} product={product} quantity={quantity} />)}
              </div>
            </div>
          )}

          {/* Technik & Zubehör inklusive */}
          {techComponents.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <SectionHeading n={2}>Technik &amp; Zubehör inklusive</SectionHeading>
              <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--gray-mid)', paddingLeft: 42 }}>Alle technischen Komponenten für einen sicheren, intelligenten Betrieb – ohne Aufpreis.</p>
              <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {techComponents.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-md)', padding: '15px 17px' }}>
                    <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', background: 'rgba(159,178,161,0.22)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.publicLabel || c.name}</div>
                      {c.publicDescription && <div style={{ fontSize: 12, color: 'var(--gray-mid)', lineHeight: 1.5, marginTop: 2 }}>{c.publicDescription}</div>}
                      {!c.included && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-mid)', marginTop: 2 }}>optional</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leistungen inklusive */}
        {publicServices.length > 0 && (
          <div style={{ background: 'var(--cream)' }}>
            <div style={{ padding: w < 700 ? '40px 20px' : '48px 44px' }}>
              <SectionHeading n={3}>Leistungen inklusive</SectionHeading>
              <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--gray-mid)', paddingLeft: 42 }}>Von der Planung bis zur Einweisung – alles aus einer Hand.</p>
              <div style={{ display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: '12px 40px' }}>
                {publicServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--gray-500)' }}>
                    <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>✓</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}{s.quantity > 1 ? ` (${s.quantity}×)` : ''}</div>
                      {s.descriptionLines.filter(l => l.trim()).map((l, j) => <div key={j} style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5, marginTop: 2 }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: w < 700 ? '40px 20px 0' : '48px 44px 0' }}>
          {/* Voraussetzungen & Zusatzarbeiten */}
          {(requirements.length > 0 || optionalWork.length > 0) && (
            <div style={{ marginBottom: 48 }}>
              <SectionHeading n={4}>Voraussetzungen &amp; mögliche Zusatzarbeiten</SectionHeading>
              <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--gray-mid)', paddingLeft: 42, maxWidth: 700 }}>Falls Zusatzarbeiten notwendig sind, werden diese vorab transparent besprochen und separat angeboten.</p>
              <div style={{ display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: 22 }}>
                <div style={{ background: 'rgba(159,178,161,0.14)', border: '1px solid var(--sage)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>Voraussetzungen</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    {requirements.map(r => (
                      <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginTop: 2 }}>✓</span>
                        <div><div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>{r.description && <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{r.description}</div>}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>Mögliche Zusatzarbeiten nach Prüfung</h3>
                  <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--gray-mid)' }}>Nicht im Festpreis enthalten – nur bei Bedarf relevant.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    {optionalWork.map(r => (
                      <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--gray-500)', color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>+</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</span>
                            <span style={{ fontSize: 11, color: 'var(--gray-mid)', whiteSpace: 'nowrap' }}>{OPTIONAL_WORK_PRICE_LABEL[r.priceType]?.(r.optionalPrice) ?? ''}</span>
                          </div>
                          {r.description && <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{r.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ablauf */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>So geht es nach Ihrer Anfrage weiter</h2>
            <div style={{ display: 'grid', gridTemplateColumns: w < 700 ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {PROCESS_STEPS.map((s, i) => (
                <div key={i}>
                  <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{i + 1}</span>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5, marginTop: 4 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 820, margin: '0 auto 48px' }}>
            <h2 style={{ margin: '0 0 22px', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Häufige Fragen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQ.map((f, i) => (
                <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>
                    {f.q}<span style={{ fontSize: 20, color: 'var(--sage)', flex: 'none' }}>{openFaq === i ? '×' : '+'}</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 20px 18px', fontSize: 13.5, color: 'var(--gray-mid)', lineHeight: 1.55 }}>{f.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', background: 'var(--sage)', borderRadius: 'var(--radius-lg)', padding: '26px 34px' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>{offer.title} – {displayPrice(offer)}</div>
                <div style={{ fontSize: 13.5, color: 'var(--charcoal)', opacity: 0.8 }}>Kostenlos &amp; unverbindlich anfragen. Wir melden uns innerhalb von 24 Stunden.</div>
              </div>
              <AdminButton variant="primary" icon="send" onClick={notify}>Paket unverbindlich anfragen</AdminButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ n, children }: { n: number; children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
      <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--charcoal)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12.5 }}>{n}</span>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{children}</h2>
    </div>
  );
}
