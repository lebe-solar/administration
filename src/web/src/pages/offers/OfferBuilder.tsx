import { useEffect, useState } from 'react';
import type { DragEvent, CSSProperties, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { AllowBadge } from '../../components/ui/Badges';
import { ProductSlotField } from './ProductSlotField';
import { ServiceCard } from './ServiceCard';
import { OfferPreview } from './OfferPreview';
import { SLOTS, linkedProductCount } from './offerUtils';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, euro, slugify } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { offersApi, offerComponentsApi } from '../../api/offers';
import { productsApi } from '../../api/products';
import { ApiError } from '../../api/client';
import type { Offer, OfferItem, Product, ProductStatus } from '../../types';

interface FormState {
  id: string; title: string; subtitle: string; description: string; conditions: string; validUntil: string; designedFor: string;
  system: string; priceAmount: string; priceCurrency: string; priceLabel: string; price: string;
  link: string; slug: string; previewImage: string;
  products: Record<string, string | number | null>;
  inclusive: OfferItem[];
  allowChanges: boolean;
  status: ProductStatus;
}

const BLANK: FormState = {
  id: '', title: '', subtitle: '', description: '', conditions: '', validUntil: '', designedFor: '',
  system: '', priceAmount: '', priceCurrency: 'EUR', priceLabel: '', price: '',
  link: '', slug: '', previewImage: '',
  products: { solarModuleId: null, solarModuleCount: 0, inverterId: null, inverterCount: 0, storageId: null, storageCount: 0, wallboxId: null, wallboxCount: 0, heatingSystemId: null, heatingSystemCount: 0 },
  inclusive: [], allowChanges: false, status: 'Draft',
};

function SectTitle({ icon, n, children, right }: { icon: string; n?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={17} /></span>
      <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)', flex: 1 }}>{n && <span style={{ color: 'var(--gray-mid)', fontWeight: 600 }}>{n}. </span>}{children}</h2>
      {right}
    </div>
  );
}
function SummaryRow({ label, value, last }: { label: string; value: string | number; last?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: last ? 'none' : '1px solid var(--gray-400)', fontSize: 13 }}><span style={{ color: 'var(--gray-mid)' }}>{label}</span><span style={{ color: 'var(--charcoal)', fontWeight: 600 }}>{value}</span></div>;
}
function segStyle(active: boolean): CSSProperties {
  return { padding: '7px 16px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-sans)', background: active ? 'var(--white)' : 'transparent', color: 'var(--charcoal)', boxShadow: active ? 'var(--shadow-card)' : 'none' };
}

export default function OfferBuilder() {
  const { mobile, onMenu } = useLayout();
  const { id: editId } = useParams<{ id: string }>();
  const editing = !!editId;
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [products, setProducts] = useState<Product[]>([]);
  const [reusable, setReusable] = useState<OfferItem[]>([]);
  const [f, setF] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [prods, comps] = await Promise.all([productsApi.list(), offerComponentsApi.list()]);
      if (cancelled) return;
      setProducts(prods);
      setReusable(comps);
      if (editing && editId) {
        const o = await offersApi.get(editId);
        if (cancelled) return;
        setF({
          id: o.id, title: o.title, subtitle: o.subtitle, description: o.description, conditions: o.conditions,
          validUntil: o.validUntil, designedFor: o.designedFor, system: o.system,
          priceAmount: o.priceAmount == null ? '' : String(o.priceAmount), priceCurrency: o.priceCurrency || 'EUR',
          priceLabel: o.priceLabel || '', price: o.price, link: o.link, slug: o.slug, previewImage: o.previewImage || '',
          products: { ...o.products } as Record<string, string | number | null>,
          inclusive: o.inclusive, allowChanges: o.allowChanges, status: o.status,
        });
      } else {
        const { id } = await offersApi.nextId();
        if (cancelled) return;
        setF({ ...BLANK, id });
      }
      setReady(true);
    }
    init();
    return () => { cancelled = true; };
  }, [editing, editId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(s => ({ ...s, [k]: v }));
  function setProduct(key: string, id: string | null, count: number) {
    setF(s => ({ ...s, products: { ...s.products, [key + 'Id']: id, [key + 'Count']: count } }));
  }

  // drag-reorder state for inclusive services
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
        const arr = [...s.inclusive];
        const [m] = arr.splice(dragIndex, 1);
        arr.splice(i, 0, m);
        return { ...s, inclusive: arr };
      });
      setDragIndex(null); setOverIndex(null);
    },
    end: () => { setDragIndex(null); setOverIndex(null); },
  };

  const setService = (i: number, v: OfferItem) => setF(s => { const arr = [...s.inclusive]; arr[i] = v; return { ...s, inclusive: arr }; });
  const delService = (i: number) => setF(s => ({ ...s, inclusive: s.inclusive.filter((_, x) => x !== i) }));
  const dupService = (i: number) => setF(s => { const arr = [...s.inclusive]; arr.splice(i + 1, 0, { ...arr[i], id: 'svc-' + Math.random().toString(36).slice(2, 7) }); return { ...s, inclusive: arr }; });
  const addBlankService = () => setF(s => ({ ...s, inclusive: [...s.inclusive, { id: 'svc-' + Math.random().toString(36).slice(2, 7), name: '', quantity: 1, price: 0, descriptionLines: [''] }] }));
  const addFromTemplate = (tid: string) => {
    const t = reusable.find(r => r.id === tid);
    if (!t) return;
    setF(s => ({ ...s, inclusive: [...s.inclusive, JSON.parse(JSON.stringify({ ...t, id: t.id + '-' + Math.random().toString(36).slice(2, 5) }))] }));
  };
  async function saveTemplate(item: OfferItem) {
    try {
      const rec = await offerComponentsApi.create({ name: item.name, quantity: item.quantity, price: item.price, descriptionLines: item.descriptionLines });
      setReusable(l => [...l, rec]);
      pushToast('success', 'Als Leistungsposition gespeichert');
    } catch {
      pushToast('error', 'Speichern der Vorlage fehlgeschlagen');
    }
  }

  const serviceSubtotal = f.inclusive.reduce((n, s) => n + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);

  async function submit(status: ProductStatus) {
    setSaving(true);
    const payload: Partial<Offer> = {
      id: f.id, title: f.title, subtitle: f.subtitle, description: f.description, conditions: f.conditions,
      validUntil: f.validUntil, designedFor: f.designedFor, system: f.system,
      priceAmount: f.priceAmount === '' ? undefined : Number(f.priceAmount),
      priceCurrency: 'EUR' as const, priceLabel: f.priceLabel,
      price: f.priceLabel || f.price || (f.priceAmount ? euro(Number(f.priceAmount)) : ''),
      link: f.link, slug: f.slug || slugify(f.title), previewImage: f.previewImage || null,
      products: f.products as Offer['products'], inclusive: f.inclusive, allowChanges: f.allowChanges, status,
    };
    try {
      if (editing && editId) await offersApi.update(editId, payload);
      else await offersApi.create(payload);
      pushToast('success', status === 'Active' ? 'Angebot veröffentlicht' : editing ? 'Angebot aktualisiert' : 'Angebot gespeichert');
      navigate('/offers');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        pushToast('error', 'Bitte Pflichtfelder prüfen');
        if (e.errors.products) setMode('edit');
      } else {
        pushToast('error', e instanceof Error ? e.message : 'Speichern fehlgeschlagen');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div>
        <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'} mobile={mobile} onMenu={onMenu} />
        <Card style={{ height: 300, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      </div>
    );
  }

  const previewOffer: Offer = {
    id: f.id, title: f.title, subtitle: f.subtitle, description: f.description, conditions: f.conditions,
    validUntil: f.validUntil, designedFor: f.designedFor, system: f.system, price: f.price,
    priceAmount: f.priceAmount === '' ? undefined : Number(f.priceAmount), priceCurrency: 'EUR', priceLabel: f.priceLabel,
    link: f.link, slug: f.slug, previewImage: f.previewImage || null,
    products: f.products as Offer['products'], inclusive: f.inclusive, allowChanges: f.allowChanges, status: f.status,
    createdAt: '', updatedAt: '',
  };

  if (mode === 'preview') {
    return (
      <div>
        <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
          subtitle={editing ? 'Angebotsdaten anpassen und veröffentlichen.' : 'Ein neues Angebotspaket zusammenstellen.'}
          mobile={mobile} onMenu={onMenu} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'var(--gray-400)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
            <button onClick={() => setMode('edit')} style={segStyle(false)}>Admin-Bearbeitung</button>
            <button onClick={() => setMode('preview')} style={segStyle(true)}>Öffentliche Vorschau</button>
          </div>
          <div style={{ flex: 1 }} />
          <AdminButton variant="outline" disabled={saving} onClick={() => submit('Draft')}>Entwurf speichern</AdminButton>
          <AdminButton variant="primary" icon="send" disabled={saving} onClick={() => submit('Active')}>Veröffentlichen</AdminButton>
        </div>
        <OfferPreview offer={previewOffer} products={products} />
      </div>
    );
  }

  const twoCol = w > 1080;
  const grid2 = { display: 'grid', gridTemplateColumns: w > 760 ? '1fr 1fr' : '1fr', gap: 16 } as const;

  return (
    <div>
      <Topbar title={editing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
        subtitle={editing ? 'Angebotsdaten anpassen und veröffentlichen.' : 'Ein neues Angebotspaket zusammenstellen.'}
        mobile={mobile} onMenu={onMenu} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: 'var(--gray-400)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
          <button onClick={() => setMode('edit')} style={segStyle(true)}>Admin-Bearbeitung</button>
          <button onClick={() => setMode('preview')} style={segStyle(false)}>Öffentliche Vorschau</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: twoCol ? '1fr 330px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <SectTitle icon="tag" n="1">Basisdaten</SectTitle>
            <div style={grid2}>
              <Field label="Angebots-ID" required error={errors.id} hint="Auto-generiert, editierbar"><TextInput value={f.id} error={errors.id} onChange={e => set('id', e.target.value)} /></Field>
              <Field label="Status" required>
                <SelectInput value={f.status} onChange={e => set('status', e.target.value as ProductStatus)}><option>Active</option><option>Draft</option><option>Hidden</option></SelectInput>
              </Field>
            </div>
            <div style={{ marginTop: 16 }}><Field label="Titel" required error={errors.title}><TextInput value={f.title} error={errors.title} onChange={e => set('title', e.target.value)} placeholder="z. B. Einfamilienhaus Premium Paket" /></Field></div>
            <div style={{ marginTop: 16 }}><Field label="Untertitel" required error={errors.subtitle}><TextInput value={f.subtitle} error={errors.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="z. B. 11,4 kWp Photovoltaikanlage mit Speicher…" /></Field></div>
            <div style={{ marginTop: 16 }}><Field label="Beschreibung" required error={errors.description}><TextArea value={f.description} error={errors.description} onChange={e => set('description', e.target.value)} placeholder="Ausführliche Beschreibung des Angebots…" /></Field></div>
            <div style={{ marginTop: 16 }}><Field label="Designed for / Zielkunde"><TextArea value={f.designedFor} onChange={e => set('designedFor', e.target.value)} placeholder="Perfekt für Einfamilienhäuser mit freier Dachfläche…" style={{ minHeight: 60 }} /></Field></div>
            <div style={{ marginTop: 16 }}><Field label="System-Zusammenfassung" hint="Kurze technische Übersicht"><TextInput value={f.system} onChange={e => set('system', e.target.value)} placeholder="24 Module | 9,5 kWh Energiespeicher inkl. Smart Meter" /></Field></div>
          </Card>

          <Card>
            <SectTitle icon="box" n="2">Produktauswahl</SectTitle>
            {errors.products && <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#c0392b' }}>{errors.products}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SLOTS.map(slot => (
                <ProductSlotField key={slot.key} slot={slot} products={products}
                  idVal={f.products[slot.key + 'Id'] as string | null} countVal={f.products[slot.key + 'Count'] as number} onChange={setProduct} />
              ))}
            </div>
          </Card>

          <Card>
            <SectTitle icon="check" n="3">Inklusivleistungen</SectTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {f.inclusive.length === 0 && <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--gray-mid)', fontSize: 13.5, border: '1.5px dashed var(--gray-400)', borderRadius: 'var(--radius-md)' }}>Noch keine Leistungen. Fügen Sie eine Vorlage oder eine neue Position hinzu.</div>}
              {f.inclusive.map((item, i) => (
                <ServiceCard key={item.id} item={item} index={i} onChange={setService} onDelete={delService} onDuplicate={dupService} onSaveTemplate={saveTemplate} drag={drag} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <AdminButton size="sm" variant="outline" icon="plus" onClick={addBlankService}>Neue Position</AdminButton>
              <div style={{ minWidth: 220 }}>
                <SelectInput value="" onChange={e => { if (e.target.value) addFromTemplate(e.target.value); e.target.value = ''; }}>
                  <option value="">+ Aus Vorlage hinzufügen…</option>
                  {reusable.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </SelectInput>
              </div>
            </div>
          </Card>

          <Card>
            <SectTitle icon="tag" n="4">Preisgestaltung</SectTitle>
            <div style={grid2}>
              <Field label="Preisbetrag" error={errors.priceAmount} hint="Nur Zahl, z. B. 18500"><TextInput type="number" value={f.priceAmount} error={errors.priceAmount} onChange={e => set('priceAmount', e.target.value)} placeholder="18500" /></Field>
              <Field label="Währung"><SelectInput value={f.priceCurrency} onChange={e => set('priceCurrency', e.target.value)}><option>EUR</option></SelectInput></Field>
            </div>
            <div style={{ marginTop: 16 }}><Field label="Anzeige-Label" error={errors.priceLabel} hint="Frei wählbarer Anzeigepreis (z. B. für Aktionen)"><TextInput value={f.priceLabel} error={errors.priceLabel} onChange={e => set('priceLabel', e.target.value)} placeholder="18.500 € - Limitiertes Angebot" /></Field></div>
            <div style={{ marginTop: 16, background: 'var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray-mid)' }}>Berechneter Zwischensumme (Leistungen)</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--charcoal)' }}>{euro(serviceSubtotal)}</div>
                </div>
                <AdminButton size="sm" variant="outline" onClick={() => set('priceAmount', String(serviceSubtotal))}>Übernehmen</AdminButton>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--gray-mid)' }}>Hinweis: Produktlistenpreise werden nicht gespeichert — Aktionspreise bitte manuell eintragen.</p>
            </div>
          </Card>

          <Card>
            <SectTitle icon="image" n="5">Medien &amp; Link</SectTitle>
            {errors.previewImage && <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#c0392b' }}>{errors.previewImage}</p>}
            <ImageUpload value={f.previewImage} onChange={v => set('previewImage', v)} />
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Slug" error={errors.slug} hint="Aus Titel generierbar">
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}><TextInput value={f.slug} error={errors.slug} onChange={e => set('slug', e.target.value)} placeholder="einfamilienhaus-premium-paket" /></div>
                  <AdminButton size="sm" variant="outline" onClick={() => set('slug', slugify(f.title))}>Auto</AdminButton>
                </div>
              </Field>
              <Field label="Öffentlicher Link"><TextInput value={f.link} onChange={e => set('link', e.target.value)} placeholder="www.lebe-solarenergie.de/package/5" /></Field>
            </div>
          </Card>

          <Card>
            <SectTitle icon="calendar" n="6">Bedingungen &amp; Gültigkeit</SectTitle>
            <Field label="Bedingungen"><TextArea value={f.conditions} onChange={e => set('conditions', e.target.value)} placeholder="Voraussetzung ist ein VDE-konformer Zählerschrank…" /></Field>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Gültig bis" required error={errors.validUntil}><TextInput type="date" value={f.validUntil} error={errors.validUntil} onChange={e => set('validUntil', e.target.value)} /></Field>
              <Field label="Änderungen durch Kunde">
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={f.allowChanges} onChange={e => set('allowChanges', e.target.checked)} style={{ accentColor: 'var(--sage)', width: 18, height: 18 }} />
                  <AllowBadge allow={f.allowChanges} />
                </label>
              </Field>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: twoCol ? 'sticky' : 'static', top: 20 }}>
          <Card>
            <SectTitle icon="send" n="7">Vorschau &amp; Veröffentlichen</SectTitle>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--gray-mid)' }}>Prüfen Sie die öffentliche Darstellung, bevor Sie veröffentlichen.</p>
            <AdminButton variant="outline" icon="eye" onClick={() => setMode('preview')} style={{ width: '100%', marginBottom: 14 }}>Öffentliche Vorschau</AdminButton>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AdminButton size="lg" variant="primary" icon="check" disabled={saving} onClick={() => submit(f.status)} style={{ width: '100%' }}>Angebot speichern</AdminButton>
              <AdminButton variant="outline" disabled={saving} onClick={() => submit('Draft')} style={{ width: '100%' }}>Als Entwurf speichern</AdminButton>
              <AdminButton variant="accent" icon="send" disabled={saving} onClick={() => submit('Active')} style={{ width: '100%' }}>Veröffentlichen</AdminButton>
              <AdminButton variant="ghost" onClick={() => navigate('/offers')} style={{ width: '100%' }}>Abbrechen</AdminButton>
            </div>
          </Card>
          <Card style={{ background: 'var(--cream)' }}>
            <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginBottom: 8, fontWeight: 600 }}>Zusammenfassung</div>
            <SummaryRow label="Produkte" value={linkedProductCount(f.products)} />
            <SummaryRow label="Leistungen" value={f.inclusive.length} />
            <SummaryRow label="Zwischensumme" value={euro(serviceSubtotal)} />
            <SummaryRow label="Anzeigepreis" value={f.priceLabel || (f.priceAmount ? euro(Number(f.priceAmount)) : '—')} />
            <SummaryRow label="Paket-Typ" value={f.allowChanges ? 'Anpassbar' : 'Fixes Paket'} last />
          </Card>
        </div>
      </div>
    </div>
  );
}
