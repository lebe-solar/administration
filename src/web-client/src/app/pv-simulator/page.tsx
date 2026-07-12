'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DoughnutChart } from '@/components/ui/DoughnutChart';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { StackedBarChart } from '@/components/ui/StackedBarChart';
import { catalog, offers } from '@/lib/mockData';
import { compute, num as numFn, euro } from '@/lib/solarCalc';

const konfigTrustPoints = ['Unverbindliche Beispielrechnung', 'Persönliche Prüfung durch LeBe', 'Für PV, Speicher und Eigenverbrauch', 'Regional im Rhein-Main-Gebiet'];

const konfigExplainers = [
  { title: 'kWp', text: 'kWp beschreibt die Spitzenleistung einer PV-Anlage unter Standardbedingungen. Die tatsächliche Stromerzeugung hängt unter anderem von Dachausrichtung, Neigung und Verschattung ab.' },
  { title: 'Eigenverbrauch', text: 'Eigenverbrauch ist der Anteil des erzeugten Solarstroms, den Sie direkt im Haus nutzen.' },
  { title: 'Autarkiegrad', text: 'Der Autarkiegrad zeigt, wie viel Ihres Strombedarfs rechnerisch durch die PV-Anlage gedeckt werden kann.' },
  { title: 'Speichergröße', text: 'Ein Speicher kann überschüssigen Solarstrom aufnehmen und später verfügbar machen, zum Beispiel am Abend.' },
  { title: 'Einspeisung', text: 'Strom, den Sie nicht direkt verbrauchen oder speichern, kann ins öffentliche Netz eingespeist werden.' },
  { title: 'Strompreis', text: 'Der Strompreis beeinflusst, wie hoch die mögliche Ersparnis durch selbst genutzten Solarstrom ausfällt.' },
];

const moduleList = Object.values(catalog).filter((p) => p.category === 'Solarmodule');
const storageList = Object.values(catalog).filter((p) => p.category === 'Heimspeicher');
const packageOptions = [{ value: 'individuell', label: 'Individuell' }, ...offers.map((o) => ({ value: 'offer-' + o.id, label: o.title }))];

function estimateRoof(address: string, moduleQty: number) {
  const addr = address.trim();
  if (addr.length <= 2) return null;
  let h = 0;
  for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const roofMaxModules = 14 + (h % 27);
  const ratio = moduleQty / roofMaxModules;
  let color = '';
  let bg = '';
  let text = '';
  if (ratio <= 0.85) { color = '#2f6b45'; bg = 'rgba(63,141,89,0.14)'; text = 'Dachcheck: Die gewählte Modulanzahl passt voraussichtlich.'; }
  else if (ratio <= 1.05) { color = '#8a6417'; bg = 'rgba(214,163,45,0.16)'; text = 'Dachcheck: Die gewählte Modulanzahl könnte knapp werden.'; }
  else { color = '#9c3f34'; bg = 'rgba(196,84,68,0.14)'; text = 'Dachcheck: Die gewählte Modulanzahl ist voraussichtlich zu hoch.'; }
  return { roofMaxModules, color, bg, text };
}

const selectStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-p5)', color: 'var(--charcoal)',
  background: 'var(--gray-300)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', outline: 'none',
};

export default function PvSimulatorPage() {
  const [consumption, setConsumption] = useState(6000);
  const [pkg, setPkg] = useState('individuell');
  const [address, setAddress] = useState('');
  const [moduleId, setModuleId] = useState('PV-1671');
  const [moduleQty, setModuleQty] = useState(20);
  const [storageId, setStorageId] = useState('none');
  const [storageQty, setStorageQty] = useState(0);
  const [baseline, setBaseline] = useState<{ moduleId: string; moduleQty: number; storageId: string; storageQty: number } | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [yieldPerKwp, setYieldPerKwp] = useState(950);
  const [price, setPrice] = useState(35);
  const [feedIn, setFeedIn] = useState(7.9);
  const [years, setYears] = useState(20);
  const [priceIncrease, setPriceIncrease] = useState(3);

  const selectedModule = catalog[moduleId] || moduleList[0];
  const hasStorage = storageId !== 'none';
  const selectedStorage = hasStorage ? catalog[storageId] : null;

  const pvKwp = (moduleQty * (selectedModule?.power || 0)) / 1000;
  const storageKwh = hasStorage ? storageQty * (selectedStorage?.power || 0) : 0;
  const pvFormula = `${moduleQty} Module × ${numFn(selectedModule?.power || 0)} W = ${numFn(pvKwp, 1)} kWp`;
  const storageFormula = hasStorage ? `${storageQty} × ${numFn(selectedStorage?.power || 0, 2)} kWh = ${numFn(storageKwh, 1)} kWh Speicher` : 'Kein Speicher ausgewählt.';

  const roof = useMemo(() => estimateRoof(address, moduleQty), [address, moduleQty]);
  const moduleQtyMax = roof ? Math.max(roof.roofMaxModules, moduleQty, 10) : 40;

  const packageNote = pkg !== 'individuell';
  const packageAdjusted = !!(packageNote && baseline && (moduleId !== baseline.moduleId || moduleQty !== baseline.moduleQty || storageId !== baseline.storageId || storageQty !== baseline.storageQty));

  const calc = useMemo(
    () => compute(consumption, pvKwp, storageKwh, { yieldPerKwp, price: price / 100, feedInTariff: feedIn / 100 }),
    [consumption, pvKwp, storageKwh, yieldPerKwp, price, feedIn]
  );
  const heute = consumption * (price / 100);

  function onPackageChange(value: string) {
    setPkg(value);
    if (value === 'individuell') { setBaseline(null); return; }
    const offerId = value.replace('offer-', '');
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) { setPkg('individuell'); setBaseline(null); return; }
    const modRef = offer.mainProducts.solarModule;
    const stRef = offer.mainProducts.storage;
    const nextModuleId = modRef ? modRef.productId : moduleId;
    const nextModuleQty = modRef ? modRef.quantity : moduleQty;
    const nextStorageId = stRef ? stRef.productId : 'none';
    const nextStorageQty = stRef ? stRef.quantity : 0;
    setModuleId(nextModuleId);
    setModuleQty(nextModuleQty);
    setStorageId(nextStorageId);
    setStorageQty(nextStorageQty);
    setBaseline({ moduleId: nextModuleId, moduleQty: nextModuleQty, storageId: nextStorageId, storageQty: nextStorageQty });
  }

  function resetAssumptions() {
    setYieldPerKwp(950);
    setPrice(35);
    setFeedIn(7.9);
    setYears(20);
    setPriceIncrease(3);
  }

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      {/* 1 · HERO */}
      <section style={{ background: 'var(--sage)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 52px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p3)', color: 'var(--charcoal)', opacity: 0.72, fontWeight: 'var(--fw-semi)' as unknown as number }}>Unverbindliche Simulation</p>
          <h1 style={{ margin: '0 0 10px', fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', maxWidth: 760 }}>PV-Simulator</h1>
          <p style={{ margin: '0 0 20px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', maxWidth: 720 }}>Paket auswählen, Anlage anpassen und Unabhängigkeit berechnen</p>
          <p style={{ margin: '0 0 30px', fontSize: 'var(--text-p3)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)', maxWidth: 680 }}>
            Starten Sie mit einem LeBe-Komplettpaket oder stellen Sie Ihre Anlage individuell zusammen. Modulanzahl, Speichergröße und Verbrauch lassen sich frei anpassen – das Ergebnis zeigt eine unverbindliche Einschätzung zu Dachpotenzial, Eigenverbrauch und Autarkie.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
            <a href="#pv-simulator-form" style={{ textDecoration: 'none' }}><Button variant="solid" tone="ink" size="lg">Simulation starten</Button></a>
            <Link href="/kontakt"><Button variant="outline" tone="ink" size="lg">Paket unverbindlich prüfen lassen</Button></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '24px 36px' }}>
            {konfigTrustPoints.map((tp) => (
              <div key={tp} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-p6)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                <span style={{ opacity: 0.6 }}>✓</span>{tp}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2+3 · SIMULATOR */}
      <section id="pv-simulator-form" style={{ maxWidth: 1180, margin: '40px auto 0', padding: '0 24px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
          {/* LEFT — Angaben */}
          <div style={{ minWidth: 0, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '32px 34px', display: 'flex', flexDirection: 'column', gap: 30 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Angaben</h2>

            <div>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Jahresstromverbrauch</div>
              <RangeSlider label="z. B. 4.500" valueLabel={`${numFn(consumption)} kWh/Jahr`} min={2000} max={15000} step={100} value={consumption} onChange={setConsumption} />
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 6 }}>Der Verbrauch ist die Grundlage für Eigenverbrauch und Autarkie.</div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-500)', paddingTop: 24 }}>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Paket auswählen</div>
              <select value={pkg} onChange={(e) => onPackageChange(e.target.value)} style={selectStyle}>
                {packageOptions.map((po) => (
                  <option key={po.value} value={po.value}>{po.label}</option>
                ))}
              </select>
              {packageNote && (
                <div style={{ marginTop: 10, fontSize: 'var(--text-p7)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                  Werte aus dem ausgewählten Paket übernommen. Sie können die Angaben weiterhin anpassen.
                </div>
              )}
              {packageAdjusted && <div style={{ marginTop: 6, fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Paketwerte angepasst</div>}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-500)', paddingTop: 24 }}>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Dachgröße optional prüfen</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Straße, Hausnummer, PLZ, Ort"
                style={selectStyle}
              />
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 6 }}>Optional: Mit der Adresse kann das Dachpotenzial grob geprüft werden.</div>
              {roof && (
                <div style={{ marginTop: 12, background: roof.bg, borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: roof.color }}>{roof.text}</div>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 4 }}>
                    Geschätzt bis zu {roof.roofMaxModules} Module möglich · rund {numFn(roof.roofMaxModules * ((selectedModule?.panelHeightMeters && selectedModule?.panelWidthMeters) ? selectedModule.panelHeightMeters * selectedModule.panelWidthMeters : 1.9))} m² Dachfläche
                  </div>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 8, lineHeight: 'var(--lh-body)' }}>Der Dachcheck basiert auf verfügbaren Karten- und Solardaten und ersetzt keine technische Vor-Ort-Prüfung.</div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-500)', paddingTop: 24 }}>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>PV-Module</div>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', marginBottom: 6 }}>Solarmodul</div>
              <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} style={{ ...selectStyle, marginBottom: 16 }}>
                {moduleList.map((p) => (
                  <option key={p.productId} value={p.productId}>{p.manufacturer} {p.name} · {numFn(p.power)} {p.unit}</option>
                ))}
              </select>
              <RangeSlider label="Anzahl der Module" valueLabel={`${moduleQty} Module`} min={1} max={moduleQtyMax} step={1} value={moduleQty} onChange={setModuleQty} />
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number, marginTop: 10 }}>{pvFormula}</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <div style={{ width: 44, height: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', borderRadius: 4, overflow: 'hidden' }}>
                  <img src={selectedModule?.logo} alt={selectedModule?.manufacturer} style={{ maxWidth: 36, maxHeight: 22, objectFit: 'contain' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{selectedModule?.name}</div>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{selectedModule?.manufacturer} · {selectedModule?.power} {selectedModule?.unit}{selectedModule?.warranty ? ` · ${selectedModule.warranty}` : ''}</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-500)', paddingTop: 24 }}>
              <div style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Speicher</div>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', marginBottom: 6 }}>Speicherprodukt</div>
              <select
                value={storageId}
                onChange={(e) => {
                  const v = e.target.value;
                  setStorageId(v);
                  if (v === 'none') setStorageQty(0);
                  else if (storageQty === 0) setStorageQty(1);
                }}
                style={{ ...selectStyle, marginBottom: 16 }}
              >
                <option value="none">Kein Speicher</option>
                {storageList.map((p) => (
                  <option key={p.productId} value={p.productId}>{p.manufacturer} {p.name} · {numFn(p.power, 2)} {p.unit}</option>
                ))}
              </select>
              {hasStorage && (
                <RangeSlider label="Anzahl Speichermodule" valueLabel={`${storageQty} Speichermodule`} min={1} max={6} step={1} value={storageQty} onChange={setStorageQty} />
              )}
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number, marginTop: 10 }}>{storageFormula}</div>
              {hasStorage && selectedStorage && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <div style={{ width: 44, height: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', borderRadius: 4, overflow: 'hidden' }}>
                    <img src={selectedStorage.logo} alt={selectedStorage.manufacturer} style={{ maxWidth: 36, maxHeight: 22, objectFit: 'contain' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{selectedStorage.name}</div>
                    <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{selectedStorage.manufacturer} · {selectedStorage.power} {selectedStorage.unit} je Modul{selectedStorage.warranty ? ` · ${selectedStorage.warranty}` : ''}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-500)', paddingTop: 18 }}>
              <div onClick={() => setAdvancedOpen(!advancedOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Annahmen</div>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 2 }}>Diese Werte können Sie anpassen, müssen es aber nicht.</div>
                </div>
                <span style={{ fontSize: 'var(--text-p4)', color: 'var(--gray-mid)' }}>{advancedOpen ? '−' : '+'}</span>
              </div>
              {advancedOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 18 }}>
                  <RangeSlider label="Spezifischer Ertrag" valueLabel={`${yieldPerKwp} kWh/kWp/Jahr`} min={750} max={1100} step={10} value={yieldPerKwp} onChange={setYieldPerKwp} />
                  <RangeSlider label="Strompreis" valueLabel={`${numFn(price, 1)} ct/kWh`} min={20} max={45} step={0.5} value={price} onChange={setPrice} />
                  <RangeSlider label="Einspeisevergütung" valueLabel={`${numFn(feedIn, 1)} ct/kWh`} min={4} max={12} step={0.1} value={feedIn} onChange={setFeedIn} />
                  <RangeSlider label="Betrachtungszeitraum" valueLabel={`${years} Jahre`} min={10} max={25} step={1} value={years} onChange={setYears} />
                  <RangeSlider label="Strompreissteigerung" valueLabel={`${priceIncrease} %/Jahr`} min={0} max={8} step={0.5} value={priceIncrease} onChange={setPriceIncrease} />
                  <div>
                    <Button variant="outline" tone="sage" onClick={resetAssumptions}>Annahmen zurücksetzen</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Simulationsergebnis */}
          <div style={{ minWidth: 0, position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Simulationsergebnis</h2>

            {roof && (
              <div style={{ background: roof.bg, borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Dachcheck</div>
                <div style={{ fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number, color: roof.color, marginTop: 4 }}>{roof.text}</div>
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 6 }}>{moduleQty} von geschätzt max. {roof.roofMaxModules} Modulen</div>
              </div>
            )}

            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 10 }}>PV-System</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>PV-Leistung</div><div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{numFn(calc.gen)} kWh/Jahr voraussichtlich</div></div>
                <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Modulanzahl</div><div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{moduleQty} × {selectedModule?.name}</div></div>
                <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Speichergröße</div><div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{storageFormula}</div></div>
                <div><div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Einspeisung</div><div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{numFn(calc.exported)} kWh/Jahr</div></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>Eigenverbrauch (geschätzt)</div>
                <DoughnutChart pct={calc.eigenPct} color="#9fb2a1" label="Eigenverbrauch" />
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 8 }}>ohne Speicher: {calc.directEigenPct} % · mit Speicher: {calc.eigenPct} %</div>
              </div>
              <div style={{ minWidth: 0, background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>Autarkiegrad (geschätzt)</div>
                <DoughnutChart pct={calc.autarkPct} color="#3c3c3b" label="Autarkie" />
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginTop: 8 }}>ohne Speicher: {calc.directAutarkPct} % · mit Speicher: {calc.autarkPct} %</div>
              </div>
            </div>

            <div style={{ background: 'var(--yellow)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Mögliche jährliche Ersparnis</div>
              <div style={{ fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', marginTop: 4 }}>{euro(calc.totalBenefit)}</div>
              <div style={{ fontSize: 'var(--text-p7)', color: 'var(--charcoal)', opacity: 0.75, marginTop: 4 }}>rechnerisch, unverbindlich</div>
            </div>

            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 6 }}>Mögliche Einsparung pro Jahr</div>
              <StackedBarChart heute={heute} gridCost={calc.gridCost} savings={calc.savings} feedIn={calc.feedIn} />
            </div>

            <div style={{ background: 'rgba(159,178,161,0.14)', border: '1px solid var(--sage)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
                Diese Berechnung ist eine unverbindliche Beispielrechnung. Die tatsächlichen Werte hängen unter anderem von Dachausrichtung, Verschattung, Verbrauchsprofil, Strompreis, Inbetriebnahmezeitpunkt, Zählerschrank und technischer Auslegung ab. Für ein konkretes Ergebnis ist eine technische Prüfung erforderlich.
              </p>
            </div>

            <div style={{ background: 'var(--sage)', borderRadius: 'var(--radius-md)', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>Nächster Schritt</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/kontakt?intent=simulationIndividual"><Button variant="solid" tone="ink">Simulation unverbindlich prüfen lassen</Button></Link>
                <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="ink">Beratung anfragen</Button></Link>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-p7)', color: 'var(--charcoal)', opacity: 0.75 }}>Die Simulation ersetzt keine technische Dach- und Zählerschrankprüfung.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 · EXPLANATION */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Was bedeuten die Werte?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
          {konfigExplainers.map((ex) => (
            <div key={ex.title} style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
              <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 8 }}>{ex.title}</div>
              <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{ex.text}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <Link href="/wissen"><Button variant="outline" tone="sage">Mehr im Wissensbereich erfahren</Button></Link>
        </div>
      </section>

      {/* 7 · CONNECTION TO OFFERS */}
      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'var(--sage)', borderRadius: 'var(--radius-lg)', padding: '40px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>Vom Simulator zum passenden PV-Paket</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>Die Simulation ist ein erster Schritt. Auf Basis Ihrer Werte können wir prüfen, welches LeBe-Komplettpaket zu Ihrem Dach, Ihrem Verbrauch und Ihren technischen Voraussetzungen passt.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/kontakt?intent=simulationIndividual"><Button variant="solid" tone="ink">PV-Paket unverbindlich prüfen lassen</Button></Link>
            <Link href="/angebote"><Button variant="outline" tone="ink">Angebote ansehen</Button></Link>
          </div>
        </div>
      </section>

      {/* 9 · FINAL CTA */}
      <section style={{ maxWidth: 1180, margin: '56px auto 90px', padding: '0 24px' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--white)', maxWidth: 640 }}>Sie möchten wissen, ob die Werte zu Ihrem Haus passen?</h3>
          <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--white)', opacity: 0.8, maxWidth: 560, lineHeight: 'var(--lh-body)' }}>Wir prüfen Ihre Angaben persönlich und besprechen, welche PV-Lösung zu Ihrem Dach, Verbrauch und Budget passt.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <Link href="/kontakt?intent=simulationIndividual"><Button variant="solid" tone="yellow" size="lg">Simulation unverbindlich prüfen lassen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="sage" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
