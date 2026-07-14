import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import { StatusBadge } from '../../components/ui/Badges';
import { PdfUpload } from '../../components/ui/PdfUpload';
import { LogoUpload } from '../../components/ui/LogoUpload';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ProductCard } from '../../components/ui/ProductCard';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { productsApi, categoriesApi } from '../../api/products';
import { manufacturersApi } from '../../api/manufacturers';
import { ApiError } from '../../api/client';
import type { Category, Manufacturer, Product, ProductStatus } from '../../types';

interface FormState {
  id: string; category: Category['key']; Header: string; Beschreibung: string;
  manufacturer_id: string; Hersteller: string; Garantie: string; Power: string; Unit: string;
  Spezifikation: string; specFilename: string; Logo: string | null; image: string; Status: ProductStatus;
  panelHeightMeters: string; panelWidthMeters: string;
}

const BLANK: FormState = {
  id: '', category: 'Solarmodule', Header: '', Beschreibung: '', manufacturer_id: '',
  Hersteller: '', Garantie: '', Power: '', Unit: 'Watt', Spezifikation: '', specFilename: '',
  Logo: null, image: '', Status: 'Active', panelHeightMeters: '', panelWidthMeters: '',
};

const UNIT_OPTIONS: Record<string, string[]> = { Solarmodule: ['Watt'], Wechselrichter: ['kW'], Heimspeicher: ['kWh'], Ladestationen: ['kW'], Heizsysteme: ['kW'] };

function SectionTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 0 16px', fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={17} /></span>
      {children}
    </h2>
  );
}

export default function ProductForm() {
  const { mobile, onMenu } = useLayout();
  const { id: editId } = useParams<{ id: string }>();
  const editing = !!editId;
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [f, setF] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [cats, mans] = await Promise.all([categoriesApi.list(), manufacturersApi.list()]);
      if (cancelled) return;
      setCategories(cats);
      setManufacturers(mans);
      if (editing && editId) {
        const p = await productsApi.get(editId);
        if (cancelled) return;
        setF({
          id: p.id, category: p.category, Header: p.Header, Beschreibung: p.Beschreibung,
          manufacturer_id: String(p.manufacturer_id), Hersteller: p.Hersteller, Garantie: p.Garantie,
          Power: p.Power == null ? '' : String(p.Power), Unit: p.Unit, Spezifikation: p.Spezifikation || '',
          specFilename: p.Spezifikation || '', Logo: p.Logo, image: p.image || '', Status: p.Status,
          panelHeightMeters: p.panelHeightMeters == null ? '' : String(p.panelHeightMeters),
          panelWidthMeters: p.panelWidthMeters == null ? '' : String(p.panelWidthMeters),
        });
      } else {
        const { id } = await productsApi.nextId('Solarmodule');
        if (cancelled) return;
        setF({ ...BLANK, id });
      }
      setReady(true);
    }
    init();
    return () => { cancelled = true; };
  }, [editing, editId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(s => ({ ...s, [k]: v }));

  async function onCategory(cat: Category['key']) {
    set('category', cat);
    if (!editing) {
      const { id } = await productsApi.nextId(cat);
      set('id', id);
    }
  }
  function onManufacturer(idStr: string) {
    const m = manufacturers.find(x => String(x.id) === idStr);
    setF(s => ({ ...s, manufacturer_id: idStr, Hersteller: m ? m.name : '', Logo: m ? m.logo : s.Logo }));
  }

  const isSolar = f.category === 'Solarmodule';
  const selMan = manufacturers.find(m => String(m.id) === f.manufacturer_id);

  const previewProduct: Product = {
    id: f.id, category: f.category, Header: f.Header || 'Produktname', Beschreibung: f.Beschreibung,
    Hersteller: f.Hersteller, manufacturer_id: f.manufacturer_id, Garantie: f.Garantie,
    Power: f.Power === '' ? null : Number(f.Power), Unit: f.Unit,
    Spezifikation: f.Spezifikation || null, hasSpec: !!f.Spezifikation, Logo: f.Logo, image: f.image || null,
    Status: f.Status,
    panelHeightMeters: f.panelHeightMeters === '' ? null : Number(f.panelHeightMeters),
    panelWidthMeters: f.panelWidthMeters === '' ? null : Number(f.panelWidthMeters),
    createdAt: '', updatedAt: '',
  };

  async function submit(status: ProductStatus) {
    setSaving(true);
    const payload = {
      id: f.id, category: f.category, Header: f.Header, Beschreibung: f.Beschreibung,
      manufacturer_id: f.manufacturer_id || undefined,
      Garantie: f.Garantie, Power: f.Power === '' ? null : f.Power, Unit: f.Unit,
      Spezifikation: f.Spezifikation || null, Logo: f.Logo, image: f.image || null, Status: status,
      panelHeightMeters: isSolar ? f.panelHeightMeters : null,
      panelWidthMeters: isSolar ? f.panelWidthMeters : null,
    };
    try {
      if (editing && editId) await productsApi.update(editId, payload);
      else await productsApi.create(payload);
      pushToast('success', editing ? 'Produkt aktualisiert' : 'Produkt gespeichert');
      navigate('/products');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        pushToast('error', 'Bitte Pflichtfelder prüfen');
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
        <Topbar title={editing ? 'Edit Product' : 'Add New Product'} mobile={mobile} onMenu={onMenu} />
        <Card style={{ height: 240, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      </div>
    );
  }

  const two = w > 820;
  const grid2 = { display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: 16 } as const;

  return (
    <div>
      <Topbar title={editing ? 'Edit Product' : 'Add New Product'}
        subtitle={editing ? 'Produktdaten bearbeiten und speichern.' : 'Neues Produkt für die Website anlegen.'}
        mobile={mobile} onMenu={onMenu} />

      <div style={{ display: 'grid', gridTemplateColumns: w > 1080 ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <SectionTitle icon="box">Basic Information</SectionTitle>
            <div style={grid2}>
              <Field label="Product ID" required error={errors.id} hint="Auto-generiert je Kategorie, editierbar">
                <TextInput value={f.id} error={errors.id} onChange={e => set('id', e.target.value)} />
              </Field>
              <Field label="Category" required>
                <SelectInput value={f.category} onChange={e => onCategory(e.target.value as Category['key'])}>
                  {categories.map(c => <option key={c.key} value={c.key}>{c.key} — {c.en}</option>)}
                </SelectInput>
              </Field>
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="Product title / Header" required error={errors.Header}>
                <TextInput value={f.Header} error={errors.Header} onChange={e => set('Header', e.target.value)} placeholder="z. B. Solar Fabrik 480W S4 BC Full Black" />
              </Field>
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="Description / Beschreibung" required error={errors.Beschreibung}>
                <TextArea value={f.Beschreibung} error={errors.Beschreibung} onChange={e => set('Beschreibung', e.target.value)} placeholder="Kurze Produktbeschreibung…" />
              </Field>
            </div>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Manufacturer" required error={errors.manufacturer_id}>
                <SelectInput value={f.manufacturer_id} onChange={e => onManufacturer(e.target.value)}>
                  <option value="">— wählen —</option>
                  {manufacturers.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
                </SelectInput>
              </Field>
              <Field label="Manufacturer ID" hint="Automatisch gesetzt">
                <TextInput value={f.manufacturer_id || ''} readOnly disabled style={{ background: 'var(--gray-300)', color: 'var(--gray-mid)' }} />
              </Field>
            </div>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Warranty / Garantie">
                <TextInput value={f.Garantie} onChange={e => set('Garantie', e.target.value)} placeholder="z. B. 30/30 Jahre" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
                <Field label="Power" error={errors.Power}>
                  <TextInput value={f.Power} error={errors.Power} onChange={e => set('Power', e.target.value)} placeholder="480" inputMode="decimal" />
                </Field>
                <Field label="Unit">
                  <SelectInput value={f.Unit} onChange={e => set('Unit', e.target.value)}>
                    {Array.from(new Set([...(UNIT_OPTIONS[f.category] || []), 'Watt', 'kW', 'kWh'])).map(u => <option key={u} value={u}>{u}</option>)}
                  </SelectInput>
                </Field>
              </div>
            </div>
          </Card>

          {isSolar && (
            <Card>
              <SectionTitle icon="panel">Solar Module Dimensions</SectionTitle>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--gray-mid)' }}>Required only for solar modules. Used to calculate panel dimensions.</p>
              <div style={grid2}>
                <Field label="Panel height (meters)" required error={errors.panelHeightMeters}>
                  <TextInput value={f.panelHeightMeters} error={errors.panelHeightMeters} onChange={e => set('panelHeightMeters', e.target.value)} placeholder="1.8" inputMode="decimal" />
                </Field>
                <Field label="Panel width (meters)" required error={errors.panelWidthMeters}>
                  <TextInput value={f.panelWidthMeters} error={errors.panelWidthMeters} onChange={e => set('panelWidthMeters', e.target.value)} placeholder="1.134" inputMode="decimal" />
                </Field>
              </div>
            </Card>
          )}

          <Card>
            <SectionTitle icon="file">Specification PDF</SectionTitle>
            {errors.Spezifikation && <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#c0392b' }}>{errors.Spezifikation}</p>}
            <PdfUpload value={f.Spezifikation} filename={f.specFilename} onChange={(url, filename) => setF(s => ({ ...s, Spezifikation: url, specFilename: filename }))} />
          </Card>

          <Card>
            <SectionTitle icon="image">Product Picture</SectionTitle>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--gray-mid)' }}>Echtes Produktfoto für die öffentliche Produktkarte — nicht zu verwechseln mit dem Herstellerlogo (siehe &quot;Logo&quot; weiter rechts).</p>
            <ImageUpload value={f.image} onChange={v => set('image', v)} label="Product picture hochladen" />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: w > 1080 ? 'sticky' : 'static', top: 20 }}>
          <Card>
            <SectionTitle icon="check">Status</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['Active', 'Draft', 'Hidden'] as ProductStatus[]).map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${f.Status === s ? 'var(--sage)' : 'var(--gray-400)'}`, background: f.Status === s ? 'rgba(159,178,161,0.14)' : 'var(--white)', cursor: 'pointer' }}>
                  <input type="radio" name="status" checked={f.Status === s} onChange={() => set('Status', s)} style={{ accentColor: 'var(--sage)' }} />
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle icon="factory">Manufacturer Logo</SectionTitle>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--gray-mid)' }}>Markenlogo des Herstellers, kein Produktfoto. Vom Hersteller übernommen, optional ersetzen.</p>
            <LogoUpload value={f.Logo} name={f.Hersteller || selMan?.name} onChange={v => set('Logo', v)} />
          </Card>
          <Card>
            <SectionTitle icon="eye">Vorschau</SectionTitle>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--gray-mid)' }}>So erscheint dieses Produkt für Kund:innen auf der Website.</p>
            <ProductCard product={previewProduct} style={{ border: '1px solid var(--gray-300)' }} />
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AdminButton size="lg" variant="primary" icon="check" disabled={saving} onClick={() => submit('Active')} style={{ width: '100%' }}>Save Product</AdminButton>
            <AdminButton variant="outline" disabled={saving} onClick={() => submit('Draft')} style={{ width: '100%' }}>Save as Draft</AdminButton>
            <AdminButton variant="ghost" onClick={() => navigate('/products')} style={{ width: '100%' }}>Cancel</AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
