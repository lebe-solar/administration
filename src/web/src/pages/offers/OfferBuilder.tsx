import { useEffect, useMemo, useState } from 'react';
import type { DragEvent, CSSProperties, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { AllowBadge } from '../../components/ui/Badges';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductSlotField } from './ProductSlotField';
import { ServiceCard } from './ServiceCard';
import { RequirementCard } from './RequirementCard';
import { AngebotCard } from './AngebotCard';
import { SLOTS, computeSystem, computeEconomics, PRICE_TYPE_OPTIONS, displayPrice } from './offerUtils';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, euro } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import { systemComponentsApi } from '../../api/systemComponents';
import { servicesApi } from '../../api/services';
import { requirementTemplatesApi } from '../../api/requirements';
import { ApiError } from '../../api/client';
import type {
  Offer, OfferMainProducts, OfferSystemComponent, OfferIncludedService, OfferRequirement, OfferEconomics,
  Product, SystemComponent, Service, RequirementTemplate, ProductStatus, OfferPriceType,
} from '../../types';

interface FormState {
  id: string; title: string; subtitle: string; status: ProductStatus;
  targetCustomer: string; designedFor: string; shortDescription: string; longDescription: string;
  priceType: OfferPriceType; priceAmount: string; priceCurrency: string; priceLabel: string; taxNote: string; validUntil: string;
  slug: string; publicUrl: string; previewImageUrl: string;
  mainProducts: OfferMainProducts;
  systemComponents: OfferSystemComponent[];
  includedServices: OfferIncludedService[];
  requirementsAndExclusions: OfferRequirement[];
  economics: OfferEconomics;
  allowChanges: boolean;
}

const BLANK_ECONOMICS: OfferEconomics = {
  enabled: true, annualConsumptionKwh: 4500, electricityPriceCentPerKwh: 35, specificYieldKwhPerKwp: 950,
  selfConsumptionRate: 0.35, autarkyRate: 0.55, feedInTariffCentPerKwh: 7.9, observationYears: 20, electricityPriceIncreasePercent: 3,
  disclaimer: 'Diese Berechnung ist eine unverbindliche Beispielrechnung. Die tatsächliche Wirtschaftlichkeit hängt unter anderem von Dachausrichtung, Verschattung, Verbrauchsprofil, Strompreis, Inbetriebnahmezeitpunkt und technischer Auslegung ab.',
};

const BLANK: FormState = {
  id: '', title: '', subtitle: '', status: 'Draft',
  targetCustomer: '', designedFor: '', shortDescription: '', longDescription: '',
  priceType: 'fixed', priceAmount: '', priceCurrency: 'EUR', priceLabel: '', taxNote: '', validUntil: '',
  slug: '', publicUrl: '', previewImageUrl: '',
  mainProducts: {},
  systemComponents: [], includedServices: [], requirementsAndExclusions: [],
  economics: BLANK_ECONOMICS,
  allowChanges: false,
};

const STEPS = [
  { n: 1, key: 'basis', label: 'Angebotsbasis', icon: 'tag' },
  { n: 2, key: 'products', label: 'Hauptprodukte', icon: 'box' },
  { n: 3, key: 'components', label: 'Systemkomponenten', icon: 'layers' },
  { n: 4, key: 'services', label: 'Inklusivleistungen', icon: 'check' },
  { n: 5, key: 'requirements', label: 'Voraussetzungen & Zusatzarbeiten', icon: 'alert' },
  { n: 6, key: 'economics', label: 'Wirtschaftlichkeit', icon: 'globe' },
  { n: 7, key: 'preview', label: 'Vorschau & Veröffentlichung', icon: 'send' },
] as const;

function SectTitle({ icon, n, children, right }: { icon: string; n?: number; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={17} /></span>
      <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)', flex: 1 }}>{n && <span style={{ color: 'var(--gray-mid)', fontWeight: 600 }}>{n}. </span>}{children}</h2>
      {right}
    </div>
  );
}
function segStyle(active: boolean): CSSProperties {
  return { padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', background: active ? 'var(--charcoal)' : 'transparent', color: active ? 'var(--yellow)' : 'var(--gray-mid)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 };
}
function ReadStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--gray-300)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
function CheckRow({ level, text }: { level: 'ok' | 'warning' | 'error'; text: string }) {
  const color = level === 'ok' ? '#1f8a5b' : level === 'warning' ? '#c79400' : '#c0392b';
  const icon = level === 'ok' ? 'check' : 'alert';
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--charcoal)', padding: '6px 0' }}>
      <span style={{ color, flex: 'none', marginTop: 1 }}><Icon name={icon} size={15} /></span>{text}
    </div>
  );
}

export default function OfferBuilder() {
  const { mobile, onMenu } = useLayout();
  const { id: editId } = useParams<{ id: string }>();
  const editing = !!editId;
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [products, setProducts] = useState<Product[]>([]);
  const [componentTemplates, setComponentTemplates] = useState<SystemComponent[]>([]);
  const [serviceTemplates, setServiceTemplates] = useState<Service[]>([]);
  const [requirementTemplates, setRequirementTemplates] = useState<RequirementTemplate[]>([]);
  const [f, setF] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoadError(false);
      try {
        const [prods, comps, svcs, reqs] = await Promise.all([productsApi.list(), systemComponentsApi.list(), servicesApi.list(), requirementTemplatesApi.list()]);
        if (cancelled) return;
        setProducts(prods);
        setComponentTemplates(comps);
        setServiceTemplates(svcs);
        setRequirementTemplates(reqs);
        if (editing && editId) {
          const o = await offersApi.get(editId);
          if (cancelled) return;
          setF({
            id: o.id, title: o.title, subtitle: o.subtitle, status: o.status,
            targetCustomer: o.targetCustomer, designedFor: o.designedFor, shortDescription: o.shortDescription, longDescription: o.longDescription,
            priceType: o.priceType, priceAmount: o.priceAmount == null ? '' : String(o.priceAmount), priceCurrency: o.priceCurrency || 'EUR',
            priceLabel: o.priceLabel, taxNote: o.taxNote, validUntil: o.validUntil || '',
            slug: o.slug || '', publicUrl: o.publicUrl, previewImageUrl: o.previewImageUrl || '',
            mainProducts: o.mainProducts, systemComponents: o.systemComponents, includedServices: o.includedServices,
            requirementsAndExclusions: o.requirementsAndExclusions, economics: o.economics, allowChanges: o.allowChanges,
          });
        } else {
          const { id } = await offersApi.nextId();
          if (cancelled) return;
          setF({ ...BLANK, id });
        }
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        setLoadError(true);
        pushToast('error', e instanceof ApiError ? e.message : 'Angebot konnte nicht geladen werden.');
      }
    }
    init();
    return () => { cancelled = true; };
  }, [editing, editId, loadAttempt, pushToast]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(s => ({ ...s, [k]: v }));
  const setEco = <K extends keyof OfferEconomics>(k: K, v: OfferEconomics[K]) => setF(s => ({ ...s, economics: { ...s.economics, [k]: v } }));

  const productsById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);
  const calculatedSystem = useMemo(() => computeSystem(f.mainProducts, productsById), [f.mainProducts, productsById]);
  const economicsResult = useMemo(() => computeEconomics(calculatedSystem.pvPowerKwp, f.economics, f.priceAmount === '' ? null : Number(f.priceAmount)), [calculatedSystem.pvPowerKwp, f.economics, f.priceAmount]);

  function goStep(n: number) { if (n >= 1 && n <= 7) { setStep(n); window.scrollTo(0, 0); } }

  function setProduct(key: string, id: string | null, count: number) {
    setF(s => {
      const mp = { ...s.mainProducts };
      if (!id) delete mp[key as keyof OfferMainProducts];
      else mp[key as keyof OfferMainProducts] = { productId: id, quantity: count };
      return { ...s, mainProducts: mp };
    });
  }

  // Step 3 — Systemkomponenten
  const addComponent = (templateId: string) => {
    const t = componentTemplates.find(c => c.id === templateId);
    if (!t) return;
    setF(s => ({ ...s, systemComponents: [...s.systemComponents, { ...t, quantity: 1 }] }));
  };
  const removeComponent = (idx: number) => setF(s => ({ ...s, systemComponents: s.systemComponents.filter((_, i) => i !== idx) }));
  const updateComponentQty = (idx: number, qty: number) => setF(s => { const arr = [...s.systemComponents]; arr[idx] = { ...arr[idx], quantity: Math.max(0, qty) }; return { ...s, systemComponents: arr }; });
  const cycleComponentVisibility = (idx: number) => setF(s => {
    const order: OfferSystemComponent['visibility'][] = ['public', 'internal', 'hidden'];
    const arr = [...s.systemComponents];
    const cur = arr[idx].visibility;
    arr[idx] = { ...arr[idx], visibility: order[(order.indexOf(cur) + 1) % 3] };
    return { ...s, systemComponents: arr };
  });
  const toggleComponentIncluded = (idx: number) => setF(s => {
    const arr = [...s.systemComponents];
    arr[idx] = { ...arr[idx], included: !arr[idx].included, optional: arr[idx].included };
    return { ...s, systemComponents: arr };
  });

  // Step 4 — Inklusivleistungen (drag-reorder)
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const drag = {
    dragIndex, overIndex,
    start: (e: DragEvent, i: number) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; },
    over: (e: DragEvent, i: number) => { e.preventDefault(); setOverIndex(i); },
    drop: (e: DragEvent, i: number) => {
      e.preventDefault();
      setF(s => {
        if (dragIndex === null) return s;
        const arr = [...s.includedServices];
        const [m] = arr.splice(dragIndex, 1);
        arr.splice(i, 0, m);
        return { ...s, includedServices: arr };
      });
      setDragIndex(null); setOverIndex(null);
    },
    end: () => { setDragIndex(null); setOverIndex(null); },
  };
  const setService = (i: number, v: OfferIncludedService) => setF(s => { const arr = [...s.includedServices]; arr[i] = v; return { ...s, includedServices: arr }; });
  const delService = (i: number) => setF(s => ({ ...s, includedServices: s.includedServices.filter((_, x) => x !== i) }));
  const dupService = (i: number) => setF(s => { const arr = [...s.includedServices]; arr.splice(i + 1, 0, { ...arr[i], id: `${arr[i].id}-${Math.random().toString(36).slice(2, 7)}` }); return { ...s, includedServices: arr }; });
  const addBlankService = () => setF(s => ({ ...s, includedServices: [...s.includedServices, { id: `svc-${Math.random().toString(36).slice(2, 7)}`, name: '', quantity: 1, internalPrice: 0, publicDescription: '', descriptionLines: [''], category: '', visibility: 'public', included: true, taxRelevantForCraftsmanWork: false }] }));
  const addServiceFromTemplate = (tid: string) => {
    const t = serviceTemplates.find(s => s.id === tid);
    if (!t) return;
    setF(s => ({ ...s, includedServices: [...s.includedServices, { id: `${t.id}-${Math.random().toString(36).slice(2, 5)}`, name: t.name, quantity: 1, internalPrice: 0, publicDescription: '', descriptionLines: [...t.descriptionLines], category: t.category, visibility: t.visibility, included: t.included, taxRelevantForCraftsmanWork: t.taxRelevantForCraftsmanWork } ] }));
  };
  async function saveServiceTemplate(item: OfferIncludedService) {
    try {
      const rec = await servicesApi.create({ name: item.name, category: item.category, descriptionLines: item.descriptionLines, taxRelevantForCraftsmanWork: item.taxRelevantForCraftsmanWork, visibility: item.visibility, included: item.included });
      setServiceTemplates(l => [...l, rec]);
      pushToast('success', 'Als Leistungsposition gespeichert');
    } catch {
      pushToast('error', 'Speichern der Vorlage fehlgeschlagen');
    }
  }

  // Step 5 — Voraussetzungen & Zusatzarbeiten
  const requirementItems = f.requirementsAndExclusions.filter(r => r.type === 'requirement');
  const optionalWorkItems = f.requirementsAndExclusions.filter(r => r.type === 'optionalAdditionalWork');
  const updateReq = (id: string, item: OfferRequirement) => setF(s => ({ ...s, requirementsAndExclusions: s.requirementsAndExclusions.map(r => r.id === id ? item : r) }));
  const removeReq = (id: string) => setF(s => ({ ...s, requirementsAndExclusions: s.requirementsAndExclusions.filter(r => r.id !== id) }));
  const addReqTemplate = (templateId: string) => {
    const t = requirementTemplates.find(r => r.id === templateId);
    if (!t) return;
    setF(s => ({ ...s, requirementsAndExclusions: [...s.requirementsAndExclusions, { ...t, id: `${t.id}-${Math.random().toString(36).slice(2, 5)}` }] }));
  };
  const addCustomReq = (type: OfferRequirement['type']) => setF(s => ({ ...s, requirementsAndExclusions: [...s.requirementsAndExclusions, { id: `custom-${Date.now()}`, title: type === 'requirement' ? 'Neue Voraussetzung' : 'Neue Zusatzarbeit', description: '', type, visibility: 'public', priceType: type === 'requirement' ? 'included' : 'onRequest' }] }));

  const serviceSubtotal = f.includedServices.reduce((n, s) => n + (Number(s.internalPrice) || 0) * (Number(s.quantity) || 1), 0);

  async function submit(status: ProductStatus) {
    setSaving(true);
    const payload: Partial<Offer> = {
      id: f.id, title: f.title, subtitle: f.subtitle, status,
      targetCustomer: f.targetCustomer, designedFor: f.designedFor, shortDescription: f.shortDescription, longDescription: f.longDescription,
      priceType: f.priceType, priceAmount: f.priceAmount === '' ? undefined : Number(f.priceAmount), priceCurrency: 'EUR',
      priceLabel: f.priceLabel, taxNote: f.taxNote, validUntil: f.validUntil || null,
      slug: f.slug || undefined, previewImageUrl: f.previewImageUrl || null,
      mainProducts: f.mainProducts, systemComponents: f.systemComponents, includedServices: f.includedServices,
      requirementsAndExclusions: f.requirementsAndExclusions, economics: f.economics, allowChanges: f.allowChanges,
    };
    try {
      let saved: Offer;
      if (editing && editId) saved = await offersApi.update(editId, payload);
      else saved = await offersApi.create(payload);
      pushToast('success', status === 'Active' ? 'Angebot veröffentlicht' : editing ? 'Angebot aktualisiert' : 'Angebot gespeichert');
      return saved;
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        pushToast('error', 'Bitte Pflichtfelder prüfen');
        if (e.errors.mainProducts) goStep(2);
      } else {
        pushToast('error', e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function submitAndExit(status: ProductStatus) {
    const saved = await submit(status);
    if (saved) navigate('/offers');
  }
  async function submitAndPreview() {
    const saved = await submit(f.status);
    if (saved) navigate(`/offers/${saved.id}/preview`);
  }

  if (loadError) {
    return (
      <div>
        <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'} mobile={mobile} onMenu={onMenu} />
        <Card pad={0}>
          <EmptyState icon="alert" title="Angebot konnte nicht geladen werden"
            text="Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
            action={<AdminButton icon="edit" onClick={() => setLoadAttempt(n => n + 1)}>Erneut versuchen</AdminButton>} />
        </Card>
      </div>
    );
  }

  if (!ready) {
    return (
      <div>
        <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'} mobile={mobile} onMenu={onMenu} />
        <Card style={{ height: 300, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      </div>
    );
  }

  const grid2 = { display: 'grid', gridTemplateColumns: w > 760 ? '1fr 1fr' : '1fr', gap: 16 } as const;

  // Plausibility checks (step 7)
  const checks: { level: 'ok' | 'warning' | 'error'; text: string }[] = [];
  const hasMainProduct = Object.keys(f.mainProducts).length > 0;
  checks.push(hasMainProduct ? { level: 'ok', text: 'Mindestens ein Hauptprodukt ausgewählt.' } : { level: 'error', text: 'Kein Hauptprodukt ausgewählt.' });
  if (f.mainProducts.solarModule) {
    checks.push((f.mainProducts.solarModule.quantity || 0) > 0 ? { level: 'ok', text: 'Modulanzahl größer als 0.' } : { level: 'error', text: 'Modulanzahl muss größer als 0 sein.' });
    checks.push(calculatedSystem.pvPowerKwp != null ? { level: 'ok', text: `Berechnete PV-Leistung: ${calculatedSystem.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWp.` } : { level: 'error', text: 'PV-Leistung konnte nicht berechnet werden (Modulleistung fehlt).' });
  }
  if (f.priceType === 'fixed') {
    checks.push(f.priceAmount !== '' ? { level: 'ok', text: 'Preisbetrag für Festpreis vorhanden.' } : { level: 'error', text: 'Preisbetrag ist bei Festpreis erforderlich.' });
  }
  if (f.economics.enabled) {
    const complete = f.economics.annualConsumptionKwh && f.economics.electricityPriceCentPerKwh && f.economics.specificYieldKwhPerKwp;
    checks.push(complete ? { level: 'ok', text: 'Annahmen für Wirtschaftlichkeit vollständig.' } : { level: 'warning', text: 'Wirtschaftlichkeit aktiviert, aber Annahmen unvollständig.' });
  }
  if (f.mainProducts.wallbox) {
    const hasWallboxService = f.includedServices.some(s => /wallbox/i.test(s.name) && s.included);
    checks.push(hasWallboxService ? { level: 'ok', text: 'Wallbox-Installation ist als Leistung enthalten.' } : { level: 'warning', text: 'Wallbox ausgewählt, aber keine Wallbox-Installation als Leistung enthalten.' });
  }
  if (f.mainProducts.storage && !f.mainProducts.inverter) {
    checks.push({ level: 'warning', text: 'Speicher ausgewählt, aber kein kompatibler Wechselrichter im Paket.' });
  }
  if (calculatedSystem.dcAcRatio != null && (calculatedSystem.dcAcRatio < 1 || calculatedSystem.dcAcRatio > 1.5)) {
    checks.push({ level: 'warning', text: `Ungewöhnliches DC/AC-Verhältnis: ${calculatedSystem.dcAcRatio.toFixed(2)}.` });
  }
  if (!f.title.trim()) checks.push({ level: 'error', text: 'Titel fehlt.' });
  if (!f.subtitle.trim()) checks.push({ level: 'warning', text: 'Untertitel fehlt.' });
  if (!f.previewImageUrl) checks.push({ level: 'warning', text: 'Kein Vorschaubild hochgeladen.' });
  if (!f.validUntil) checks.push({ level: 'warning', text: 'Kein Gültigkeitsdatum gesetzt.' });
  const hasBlockingError = checks.some(c => c.level === 'error');

  return (
    <div>
      <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
        subtitle={editing ? 'Angebotsdaten anpassen und veröffentlichen.' : 'Ein neues Angebotspaket zusammenstellen.'}
        mobile={mobile} onMenu={onMenu} />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap', background: 'var(--gray-300)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
        {STEPS.map(s => (
          <button key={s.n} onClick={() => goStep(s.n)} style={segStyle(step === s.n)}>
            <Icon name={s.icon} size={13} />{mobile ? s.n : `${s.n}. ${s.label}`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: w > 1080 ? '1fr 330px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {step === 1 && (
            <Card>
              <SectTitle icon="tag" n={1}>Angebotsbasis</SectTitle>
              <div style={grid2}>
                <Field label="Angebots-ID" required error={errors.id} hint="Auto-generiert, editierbar"><TextInput value={f.id} error={errors.id} onChange={e => set('id', e.target.value)} /></Field>
                <Field label="Status" required><SelectInput value={f.status} onChange={e => set('status', e.target.value as ProductStatus)}><option>Active</option><option>Draft</option><option>Hidden</option></SelectInput></Field>
              </div>
              <div style={{ marginTop: 16 }}><Field label="Titel" required error={errors.title}><TextInput value={f.title} error={errors.title} onChange={e => set('title', e.target.value)} placeholder="z. B. Einfamilienhaus Premium Paket" /></Field></div>
              <div style={{ marginTop: 16 }}><Field label="Untertitel" required error={errors.subtitle}><TextInput value={f.subtitle} error={errors.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="z. B. 11,4 kWp Photovoltaikanlage mit Speicher…" /></Field></div>
              <div style={{ marginTop: 16 }}><Field label="Zielgruppe"><TextInput value={f.targetCustomer} onChange={e => set('targetCustomer', e.target.value)} placeholder="z. B. Einfamilienhäuser mit freier Dachfläche" /></Field></div>
              <div style={{ marginTop: 16 }}><Field label="Kurzbeschreibung" required error={errors.shortDescription}><TextInput value={f.shortDescription} error={errors.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Kurze Zusammenfassung für die Angebotskarte" /></Field></div>
              <div style={{ marginTop: 16 }}><Field label="Langbeschreibung"><TextArea value={f.longDescription} onChange={e => set('longDescription', e.target.value)} placeholder="Ausführliche Beschreibung des Angebots…" /></Field></div>
              <div style={{ marginTop: 16 }}><Field label="Designed for / Zielkunde"><TextArea value={f.designedFor} onChange={e => set('designedFor', e.target.value)} placeholder="Perfekt für Einfamilienhäuser mit freier Dachfläche…" style={{ minHeight: 60 }} /></Field></div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-400)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 12 }}>Preisart</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {PRICE_TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => set('priceType', opt.value)} type="button"
                      style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: `1px solid ${f.priceType === opt.value ? 'var(--sage)' : 'var(--gray-500)'}`, background: f.priceType === opt.value ? 'rgba(159,178,161,0.18)' : 'var(--white)', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', cursor: 'pointer' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={grid2}>
                  <Field label="Preisbetrag" error={errors.priceAmount} hint="Nur Zahl, z. B. 18500"><TextInput type="number" value={f.priceAmount} error={errors.priceAmount} onChange={e => set('priceAmount', e.target.value)} placeholder="18500" /></Field>
                  <Field label="Preislabel" error={errors.priceLabel} hint="Frei wählbarer Anzeigepreis"><TextInput value={f.priceLabel} error={errors.priceLabel} onChange={e => set('priceLabel', e.target.value)} placeholder="18.500 € - Limitiertes Angebot" /></Field>
                </div>
                <div style={{ ...grid2, marginTop: 16 }}>
                  <Field label="Steuerhinweis"><TextInput value={f.taxNote} onChange={e => set('taxNote', e.target.value)} placeholder="Preis inkl. 0 % USt., sofern Voraussetzungen erfüllt sind" /></Field>
                  <Field label="Gültig bis" required error={errors.validUntil}><TextInput type="date" value={f.validUntil} error={errors.validUntil} onChange={e => set('validUntil', e.target.value)} /></Field>
                </div>
                {f.priceType !== 'fixed' && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--gray-mid)' }}>Hinweis: „Final nach Dachprüfung und technischer Prüfung.” wird öffentlich angezeigt, wenn der Preis nicht final ist.</p>}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-400)' }}>
                <Field label="Vorschaubild" error={errors.previewImageUrl}><ImageUpload value={f.previewImageUrl} onChange={v => set('previewImageUrl', v)} /></Field>
                <div style={{ ...grid2, marginTop: 16 }}>
                  <Field label="Slug / öffentlicher Link" error={errors.slug}><TextInput value={f.slug} error={errors.slug} onChange={e => set('slug', e.target.value)} placeholder="einfamilienhaus-premium-paket" /></Field>
                  <Field label="Änderungen durch Kunde erlauben">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={f.allowChanges} onChange={e => set('allowChanges', e.target.checked)} style={{ accentColor: 'var(--sage)', width: 18, height: 18 }} />
                      <AllowBadge allow={f.allowChanges} />
                    </label>
                  </Field>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <SectTitle icon="box" n={2}>Hauptprodukte</SectTitle>
              {errors.mainProducts && <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#c0392b' }}>{errors.mainProducts}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SLOTS.map(slot => (
                  <ProductSlotField key={slot.key} slot={slot} products={products}
                    idVal={f.mainProducts[slot.key]?.productId ?? null} countVal={f.mainProducts[slot.key]?.quantity}
                    onChange={setProduct} />
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--gray-400)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Berechnetes System</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <ReadStat label="PV-Leistung" value={calculatedSystem.pvPowerKwp != null ? `${calculatedSystem.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWp` : '—'} />
                  <ReadStat label="Modulfläche" value={calculatedSystem.moduleAreaM2 != null ? `${calculatedSystem.moduleAreaM2.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²` : '—'} />
                  <ReadStat label="Wechselrichterleistung" value={calculatedSystem.inverterPowerKw != null ? `${calculatedSystem.inverterPowerKw.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kW` : '—'} />
                  <ReadStat label="Speichergröße" value={calculatedSystem.storageCapacityKwh != null ? `${calculatedSystem.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWh` : '—'} />
                  <ReadStat label="DC/AC-Verhältnis" value={calculatedSystem.dcAcRatio != null ? calculatedSystem.dcAcRatio.toFixed(2) : '—'} />
                </div>
                {f.mainProducts.solarModule && !productsById[f.mainProducts.solarModule.productId]?.panelHeightMeters && (
                  <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#c79400', display: 'flex', gap: 6, alignItems: 'flex-start' }}><Icon name="alert" size={14} style={{ marginTop: 1 }} />Modulmaße fehlen — Modulfläche kann nicht berechnet werden.</p>
                )}
                {calculatedSystem.dcAcRatio != null && (calculatedSystem.dcAcRatio < 1 || calculatedSystem.dcAcRatio > 1.5) && (
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#c79400', display: 'flex', gap: 6, alignItems: 'flex-start' }}><Icon name="alert" size={14} style={{ marginTop: 1 }} />Ungewöhnliches DC/AC-Verhältnis ({calculatedSystem.dcAcRatio.toFixed(2)}).</p>
                )}
                {f.mainProducts.storage && !f.mainProducts.inverter && (
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#c79400', display: 'flex', gap: 6, alignItems: 'flex-start' }}><Icon name="alert" size={14} style={{ marginTop: 1 }} />Speicher ausgewählt, aber kein Wechselrichter im Paket.</p>
                )}
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <SectTitle icon="layers" n={3}>Systemkomponenten</SectTitle>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--gray-mid)' }}>Technische Komponenten und Zubehör — getrennt von den Hauptprodukten. Klicken Sie auf die Sichtbarkeit, um zwischen öffentlich / intern / verborgen zu wechseln.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {f.systemComponents.length === 0 && <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--gray-mid)', fontSize: 13.5, border: '1.5px dashed var(--gray-400)', borderRadius: 'var(--radius-md)' }}>Noch keine Systemkomponenten. Fügen Sie eine Vorlage hinzu.</div>}
                {f.systemComponents.map((c, i) => (
                  <div key={`${c.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '10px 12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--gray-mid)' }}>{c.category}</div>
                    </div>
                    <TextInput type="number" min="0" value={c.quantity} onChange={e => updateComponentQty(i, Number(e.target.value))} style={{ width: 70 }} />
                    <button type="button" onClick={() => toggleComponentIncluded(i)} style={{ padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gray-500)', background: c.included ? 'rgba(31,138,91,0.14)' : 'var(--gray-300)', color: c.included ? '#1f8a5b' : 'var(--gray-mid)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>{c.included ? 'inklusive' : 'optional'}</button>
                    <button type="button" onClick={() => cycleComponentVisibility(i)} style={{ padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gray-500)', background: 'var(--gray-300)', fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)', cursor: 'pointer' }}>{c.visibility}</button>
                    <button type="button" onClick={() => removeComponent(i)} aria-label="Entfernen" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', display: 'inline-flex' }}><Icon name="x" size={16} /></button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, minWidth: 240 }}>
                <SelectInput value="" onChange={e => { if (e.target.value) addComponent(e.target.value); e.target.value = ''; }}>
                  <option value="">+ Vorlage hinzufügen…</option>
                  {componentTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </SelectInput>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <SectTitle icon="check" n={4}>Inklusivleistungen</SectTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {f.includedServices.length === 0 && <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--gray-mid)', fontSize: 13.5, border: '1.5px dashed var(--gray-400)', borderRadius: 'var(--radius-md)' }}>Noch keine Leistungen. Fügen Sie eine Vorlage oder eine neue Position hinzu.</div>}
                {f.includedServices.map((item, i) => (
                  <ServiceCard key={item.id} item={item} index={i} onChange={setService} onDelete={delService} onDuplicate={dupService} onSaveTemplate={saveServiceTemplate} drag={drag} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <AdminButton size="sm" variant="outline" icon="plus" onClick={addBlankService}>Neue Position</AdminButton>
                <div style={{ minWidth: 220 }}>
                  <SelectInput value="" onChange={e => { if (e.target.value) addServiceFromTemplate(e.target.value); e.target.value = ''; }}>
                    <option value="">+ Aus Vorlage hinzufügen…</option>
                    {serviceTemplates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </SelectInput>
                </div>
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <SectTitle icon="alert" n={5}>Voraussetzungen &amp; Zusatzarbeiten</SectTitle>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--charcoal)', background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>Falls Zusatzarbeiten notwendig sind, werden diese vorab transparent besprochen und separat angeboten.</p>
              <div style={grid2}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Voraussetzungen</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {requirementItems.map(item => <RequirementCard key={item.id} item={item} onChange={v => updateReq(item.id, v)} onRemove={() => removeReq(item.id)} />)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <AdminButton size="sm" variant="outline" icon="plus" onClick={() => addCustomReq('requirement')}>Eigene</AdminButton>
                    <div style={{ flex: '1 1 180px', minWidth: 160 }}>
                      <SelectInput value="" onChange={e => { if (e.target.value) addReqTemplate(e.target.value); e.target.value = ''; }}>
                        <option value="">+ Vorlage…</option>
                        {requirementTemplates.filter(r => r.type === 'requirement').map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </SelectInput>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Mögliche Zusatzarbeiten nach Prüfung</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {optionalWorkItems.map(item => <RequirementCard key={item.id} item={item} onChange={v => updateReq(item.id, v)} onRemove={() => removeReq(item.id)} />)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <AdminButton size="sm" variant="outline" icon="plus" onClick={() => addCustomReq('optionalAdditionalWork')}>Eigene</AdminButton>
                    <div style={{ flex: '1 1 180px', minWidth: 160 }}>
                      <SelectInput value="" onChange={e => { if (e.target.value) addReqTemplate(e.target.value); e.target.value = ''; }}>
                        <option value="">+ Vorlage…</option>
                        {requirementTemplates.filter(r => r.type === 'optionalAdditionalWork').map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </SelectInput>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <SectTitle icon="globe" n={6}>Wirtschaftlichkeit</SectTitle>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.economics.enabled} onChange={e => setEco('enabled', e.target.checked)} style={{ accentColor: 'var(--sage)', width: 18, height: 18 }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Wirtschaftlichkeitsrechnung auf der Angebotsseite anzeigen</span>
              </label>

              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Automatisch berechnet</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
                <ReadStat label="PV-Leistung" value={calculatedSystem.pvPowerKwp != null ? `${calculatedSystem.pvPowerKwp.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWp` : '—'} />
                <ReadStat label="Speichergröße" value={calculatedSystem.storageCapacityKwh != null ? `${calculatedSystem.storageCapacityKwh.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kWh` : '—'} />
                <ReadStat label="Wechselrichterleistung" value={calculatedSystem.inverterPowerKw != null ? `${calculatedSystem.inverterPowerKw.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kW` : '—'} />
                <ReadStat label="Modulfläche" value={calculatedSystem.moduleAreaM2 != null ? `${calculatedSystem.moduleAreaM2.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²` : '—'} />
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Editierbare Annahmen</div>
              <div style={{ display: 'grid', gridTemplateColumns: w > 760 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <Field label="Jahresstromverbrauch (kWh)"><TextInput type="number" value={f.economics.annualConsumptionKwh ?? ''} onChange={e => setEco('annualConsumptionKwh', Number(e.target.value))} /></Field>
                <Field label="Strompreis (ct/kWh)"><TextInput type="number" value={f.economics.electricityPriceCentPerKwh ?? ''} onChange={e => setEco('electricityPriceCentPerKwh', Number(e.target.value))} /></Field>
                <Field label="Spez. Ertrag (kWh/kWp/Jahr)"><TextInput type="number" value={f.economics.specificYieldKwhPerKwp ?? ''} onChange={e => setEco('specificYieldKwhPerKwp', Number(e.target.value))} /></Field>
                <Field label="Eigenverbrauchsquote (%)"><TextInput type="number" min="0" max="100" value={f.economics.selfConsumptionRate != null ? Math.round(f.economics.selfConsumptionRate * 100) : ''} onChange={e => setEco('selfConsumptionRate', Math.min(100, Math.max(0, Number(e.target.value))) / 100)} /></Field>
                <Field label="Autarkiegrad (%)"><TextInput type="number" min="0" max="100" value={f.economics.autarkyRate != null ? Math.round(f.economics.autarkyRate * 100) : ''} onChange={e => setEco('autarkyRate', Math.min(100, Math.max(0, Number(e.target.value))) / 100)} /></Field>
                <Field label="Einspeisevergütung (ct/kWh)"><TextInput type="number" value={f.economics.feedInTariffCentPerKwh ?? ''} onChange={e => setEco('feedInTariffCentPerKwh', Number(e.target.value))} /></Field>
                <Field label="Betrachtungszeitraum (Jahre)"><TextInput type="number" value={f.economics.observationYears ?? ''} onChange={e => setEco('observationYears', Number(e.target.value))} /></Field>
                <Field label="Strompreissteigerung (%, optional)"><TextInput type="number" value={f.economics.electricityPriceIncreasePercent ?? ''} onChange={e => setEco('electricityPriceIncreasePercent', Number(e.target.value))} /></Field>
              </div>

              {f.economics.enabled && (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Berechnetes Ergebnis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
                    <ReadStat label="Jahresertrag" value={economicsResult.expectedAnnualYieldKwh != null ? `${Math.round(economicsResult.expectedAnnualYieldKwh).toLocaleString('de-DE')} kWh` : '—'} />
                    <ReadStat label="Ersparnis/Jahr" value={economicsResult.estimatedSavingsPerYear != null ? euro(economicsResult.estimatedSavingsPerYear) : '—'} />
                    <ReadStat label="Einspeisevergütung/Jahr" value={economicsResult.estimatedFeedInRevenuePerYear != null ? euro(economicsResult.estimatedFeedInRevenuePerYear) : '—'} />
                    <ReadStat label="Gesamtvorteil/Jahr" value={economicsResult.estimatedTotalBenefitPerYear != null ? euro(economicsResult.estimatedTotalBenefitPerYear) : '—'} />
                    <ReadStat label="Amortisation" value={economicsResult.amortizationYears != null ? `${economicsResult.amortizationYears.toFixed(1)} Jahre` : '—'} />
                  </div>
                </>
              )}

              <Field label="Disclaimer (wird immer angezeigt, wenn Wirtschaftlichkeit aktiv ist)">
                <TextArea value={f.economics.disclaimer} onChange={e => setEco('disclaimer', e.target.value)} />
              </Field>
            </Card>
          )}

          {step === 7 && (
            <>
              <Card>
                <SectTitle icon="tag" n={7}>Angebots-Kachel Vorschau</SectTitle>
                <div style={{ maxWidth: 360 }}>
                  <AngebotCard
                    offer={{ id: f.id, title: f.title, subtitle: f.subtitle, status: f.status, validUntil: f.validUntil || null, previewImageUrl: f.previewImageUrl || null, mainProducts: f.mainProducts, includedServices: f.includedServices }}
                    calculatedSystem={calculatedSystem}
                    productsById={productsById}
                    price={displayPrice({ priceType: f.priceType, priceAmount: f.priceAmount === '' ? null : Number(f.priceAmount), priceLabel: f.priceLabel })}
                  />
                </div>
              </Card>
              <Card>
                <SectTitle icon="search" n={7}>SEO Vorschau</SectTitle>
                <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, color: '#1a0dab' }}>lebe-solarenergie.de/angebot/{f.slug || '…'}</div>
                  <div style={{ fontSize: 16, color: '#1a0dab', fontWeight: 600, marginTop: 2 }}>{f.title || 'Angebotstitel'}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 2 }}>{f.shortDescription || 'Kurzbeschreibung fehlt.'}</div>
                </div>
              </Card>
              <Card>
                <SectTitle icon="check" n={7}>Plausibilitätscheck</SectTitle>
                <div>
                  {checks.map((c, i) => <CheckRow key={i} level={c.level} text={c.text} />)}
                </div>
              </Card>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: w > 1080 ? 'sticky' : 'static', top: 20 }}>
          <Card>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <AdminButton variant="outline" size="sm" onClick={() => goStep(step - 1)} disabled={step === 1} style={{ flex: 1 }}>Zurück</AdminButton>
              <AdminButton variant="primary" size="sm" onClick={() => goStep(step + 1)} disabled={step === 7} style={{ flex: 1 }}>Weiter</AdminButton>
            </div>
            <AdminButton variant="outline" icon="eye" disabled={saving} onClick={submitAndPreview} style={{ width: '100%', marginBottom: 10 }}>Detailseiten-Vorschau öffnen</AdminButton>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AdminButton size="lg" variant="primary" icon="check" disabled={saving} onClick={() => submitAndExit(f.status)} style={{ width: '100%' }}>Angebot speichern</AdminButton>
              <AdminButton variant="outline" disabled={saving} onClick={() => submitAndExit('Draft')} style={{ width: '100%' }}>Als Entwurf speichern</AdminButton>
              <AdminButton variant="accent" icon="send" disabled={saving || hasBlockingError} onClick={() => submitAndExit('Active')} style={{ width: '100%' }}>Veröffentlichen</AdminButton>
              <AdminButton variant="ghost" onClick={() => navigate('/offers')} style={{ width: '100%' }}>Abbrechen</AdminButton>
            </div>
          </Card>
          <Card style={{ background: 'var(--cream)' }}>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginBottom: 8, fontWeight: 600 }}>Zusammenfassung</div>
            <SummaryRow label="Hauptprodukte" value={Object.keys(f.mainProducts).length} />
            <SummaryRow label="Systemkomponenten" value={f.systemComponents.length} />
            <SummaryRow label="Leistungen" value={f.includedServices.length} />
            <SummaryRow label="Interne Kosten Leistungen" value={euro(serviceSubtotal)} />
            <SummaryRow label="Anzeigepreis" value={displayPrice({ priceType: f.priceType, priceAmount: f.priceAmount === '' ? null : Number(f.priceAmount), priceLabel: f.priceLabel })} last />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string | number; last?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: last ? 'none' : '1px solid var(--gray-400)', fontSize: 13 }}><span style={{ color: 'var(--gray-mid)' }}>{label}</span><span style={{ color: 'var(--charcoal)', fontWeight: 600 }}>{value}</span></div>;
}
