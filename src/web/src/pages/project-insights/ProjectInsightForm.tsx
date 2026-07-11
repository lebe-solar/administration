import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Tag } from '../../components/ui/Tag';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { projectInsightsApi } from '../../api/projectInsights';
import { ApiError } from '../../api/client';
import type { BadgeType, ProjectInsightBadge, ProjectInsightGalleryImage, ProjectInsightStatus } from '../../types';

interface FormState {
  id: string; status: ProjectInsightStatus;
  title: string; locationLabel: string; buildingType: string; customerType: string; projectYear: string; projectStatus: string;
  mainImage: string; imageAlt: string; galleryImages: ProjectInsightGalleryImage[];
  badges: ProjectInsightBadge[];
  shortDescription: string; internalNote: string;
  visibility: { landingPage: boolean; aboutPage: boolean; projectOverview: boolean; offerDetails: boolean; internalOnly: boolean };
  featured: boolean; sortOrder: string; publishedFrom: string; publishedUntil: string;
}

const BLANK: FormState = {
  id: '', status: 'Entwurf',
  title: '', locationLabel: '', buildingType: 'Einfamilienhaus', customerType: 'Privatkunde', projectYear: '', projectStatus: 'umgesetzt',
  mainImage: '', imageAlt: '', galleryImages: [],
  badges: [],
  shortDescription: '', internalNote: '',
  visibility: { landingPage: false, aboutPage: false, projectOverview: true, offerDetails: false, internalOnly: false },
  featured: false, sortOrder: '0', publishedFrom: '', publishedUntil: '',
};

const BADGE_TYPES: BadgeType[] = ['Leistung', 'Modulanzahl', 'Speicher', 'Wallbox', 'Hersteller', 'Besonderheit', 'Gebäudetyp', 'Sonstiges'];
const BUILDING_TYPES = ['Einfamilienhaus', 'Reihenhaus', 'Mehrfamilienhaus', 'Gewerbedach', 'Produktionsbetrieb', 'Bürogebäude', 'Sonstiges'];
const CUSTOMER_TYPES = ['Privatkunde', 'Gewerbekunde', 'Intern / Beispiel', 'Nicht anzeigen'];
const PROJECT_STATUSES = ['geplant', 'in Umsetzung', 'umgesetzt', 'Beispiel / repräsentativ'];

function SectionTitle({ icon, n, children }: { icon: string; n: number; children: ReactNode }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 0 16px', fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(159,178,161,0.20)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={17} /></span>
      <span style={{ color: 'var(--gray-mid)', fontWeight: 600 }}>{n}.</span>{children}
    </h2>
  );
}

export default function ProjectInsightForm() {
  const { mobile, onMenu } = useLayout();
  const { id: editId } = useParams<{ id: string }>();
  const editing = !!editId;
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [f, setF] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBadgeText, setNewBadgeText] = useState('');
  const [newBadgeType, setNewBadgeType] = useState<BadgeType>('Besonderheit');

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (editing && editId) {
        const p = await projectInsightsApi.get(editId);
        if (cancelled) return;
        setF({
          id: p.id, status: p.status, title: p.title, locationLabel: p.locationLabel, buildingType: p.buildingType, customerType: p.customerType,
          projectYear: p.projectYear == null ? '' : String(p.projectYear), projectStatus: p.projectStatus,
          mainImage: p.mainImage || '', imageAlt: p.imageAlt, galleryImages: p.galleryImages,
          badges: p.badges, shortDescription: p.shortDescription, internalNote: p.internalNote || '',
          visibility: p.visibility, featured: p.featured, sortOrder: String(p.sortOrder),
          publishedFrom: p.publishedFrom || '', publishedUntil: p.publishedUntil || '',
        });
      } else {
        const { id } = await projectInsightsApi.nextId();
        if (cancelled) return;
        setF({ ...BLANK, id });
      }
      setReady(true);
    }
    init();
    return () => { cancelled = true; };
  }, [editing, editId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(s => ({ ...s, [k]: v }));
  const setVis = (k: keyof FormState['visibility'], v: boolean) => setF(s => ({ ...s, visibility: { ...s.visibility, [k]: v } }));

  function addBadge() {
    if (!newBadgeText.trim()) return;
    setF(s => ({ ...s, badges: [...s.badges, { id: `badge-${Date.now()}`, label: newBadgeText.trim(), type: newBadgeType, visible: true, sortOrder: s.badges.length }] }));
    setNewBadgeText('');
  }
  const removeBadge = (id: string) => setF(s => ({ ...s, badges: s.badges.filter(b => b.id !== id) }));
  const toggleBadgeVisible = (id: string) => setF(s => ({ ...s, badges: s.badges.map(b => b.id === id ? { ...b, visible: !b.visible } : b) }));
  const moveBadge = (idx: number, dir: -1 | 1) => setF(s => {
    const arr = [...s.badges];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return s;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    return { ...s, badges: arr.map((b, i) => ({ ...b, sortOrder: i })) };
  });

  function addGalleryImage() {
    setF(s => ({ ...s, galleryImages: [...s.galleryImages, { id: `gal-${Date.now()}`, image: '', alt: '', sortOrder: s.galleryImages.length, visible: true }] }));
  }
  const setGalleryImage = (id: string, patch: Partial<ProjectInsightGalleryImage>) => setF(s => ({ ...s, galleryImages: s.galleryImages.map(g => g.id === id ? { ...g, ...patch } : g) }));
  const removeGalleryImage = (id: string) => setF(s => ({ ...s, galleryImages: s.galleryImages.filter(g => g.id !== id) }));

  async function submit(status: ProjectInsightStatus) {
    setSaving(true);
    const payload = {
      id: f.id, status, title: f.title, locationLabel: f.locationLabel, buildingType: f.buildingType, customerType: f.customerType,
      projectYear: f.projectYear === '' ? null : Number(f.projectYear), projectStatus: f.projectStatus,
      mainImage: f.mainImage || null, imageAlt: f.imageAlt, galleryImages: f.galleryImages,
      badges: f.badges, shortDescription: f.shortDescription, internalNote: f.internalNote,
      visibility: f.visibility, featured: f.featured, sortOrder: Number(f.sortOrder) || 0,
      publishedFrom: f.publishedFrom || null, publishedUntil: f.publishedUntil || null,
    };
    try {
      if (editing && editId) await projectInsightsApi.update(editId, payload);
      else await projectInsightsApi.create(payload);
      pushToast('success', status === 'Veröffentlicht' ? 'Projekt veröffentlicht' : editing ? 'Projekt aktualisiert' : 'Projekt gespeichert');
      navigate('/project-insights');
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
        <Topbar title={editing ? 'Projekt bearbeiten' : 'Projekt erstellen'} mobile={mobile} onMenu={onMenu} />
        <Card style={{ height: 240, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      </div>
    );
  }

  const grid2 = { display: 'grid', gridTemplateColumns: w > 760 ? '1fr 1fr' : '1fr', gap: 16 } as const;

  // Validation warnings (step "Vorschau")
  const warnings: string[] = [];
  if (!f.mainImage) warnings.push('Für öffentliche Projektkarten wird ein Bild benötigt.');
  if (f.mainImage && !f.imageAlt.trim()) warnings.push('Bitte Alt-Text für Barrierefreiheit und SEO ergänzen.');
  const noVisibility = !f.visibility.landingPage && !f.visibility.aboutPage && !f.visibility.projectOverview && !f.visibility.offerDetails;
  if (noVisibility) warnings.push('Dieses Projekt wird aktuell nirgendwo angezeigt.');
  if (f.status === 'Entwurf') warnings.push('Das Projekt ist als Entwurf gespeichert und nicht öffentlich sichtbar.');
  if (/\b\d{1,3}\b.*straße|str\.\s*\d/i.test(f.locationLabel)) warnings.push('Bitte prüfen: Öffentliche Projektkarten sollten keine vollständigen Kundenadressen enthalten.');

  return (
    <div>
      <Topbar title={editing ? 'Projekt bearbeiten' : 'Projekt erstellen'}
        subtitle={editing ? 'Projekt-Einblick anpassen und veröffentlichen.' : 'Neuen Projekt-Einblick anlegen.'}
        mobile={mobile} onMenu={onMenu} />

      <div style={{ display: 'grid', gridTemplateColumns: w > 1080 ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <SectionTitle icon="tag" n={1}>Basisdaten</SectionTitle>
            <div style={grid2}>
              <Field label="Projekt-Titel" required error={errors.title}><TextInput value={f.title} error={errors.title} onChange={e => set('title', e.target.value)} placeholder="z. B. Einfamilienhaus mit Speicher & Wallbox" /></Field>
              <Field label="Ort / Region" required error={errors.locationLabel} hint="Bitte keine vollständige Kundenadresse eintragen, außer es liegt eine ausdrückliche Freigabe vor."><TextInput value={f.locationLabel} error={errors.locationLabel} onChange={e => set('locationLabel', e.target.value)} placeholder="z. B. Rödermark" /></Field>
            </div>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Gebäudetyp"><SelectInput value={f.buildingType} onChange={e => set('buildingType', e.target.value)}>{BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}</SelectInput></Field>
              <Field label="Kundentyp"><SelectInput value={f.customerType} onChange={e => set('customerType', e.target.value)}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</SelectInput></Field>
            </div>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Projektjahr (optional)"><TextInput type="number" value={f.projectYear} onChange={e => set('projectYear', e.target.value)} placeholder="2025" /></Field>
              <Field label="Projektstatus" hint="Beispiel/repräsentativ = kein realer abgeschlossener Referenzfall"><SelectInput value={f.projectStatus} onChange={e => set('projectStatus', e.target.value)}>{PROJECT_STATUSES.map(t => <option key={t}>{t}</option>)}</SelectInput></Field>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="image" n={2}>Bild &amp; Medien</SectionTitle>
            <Field label="Hauptbild" hint="Empfohlen: Querformat, mindestens 1200 × 800 px."><ImageUpload value={f.mainImage} onChange={v => set('mainImage', v)} /></Field>
            <div style={{ marginTop: 16 }}><Field label="Alt-Text" required error={errors.imageAlt}><TextInput value={f.imageAlt} error={errors.imageAlt} onChange={e => set('imageAlt', e.target.value)} placeholder="Photovoltaikanlage auf einem Einfamilienhaus in Rödermark" /></Field></div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-400)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Weitere Bilder (optional)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {f.galleryImages.map(g => (
                  <div key={g.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                    <div style={{ width: 100, flex: 'none' }}><ImageUpload value={g.image} onChange={v => setGalleryImage(g.id, { image: v })} label="Bild" /></div>
                    <div style={{ flex: 1 }}><TextInput value={g.alt} onChange={e => setGalleryImage(g.id, { alt: e.target.value })} placeholder="Alt-Text" /></div>
                    <IconAction icon="x" label="Entfernen" tone="danger" onClick={() => removeGalleryImage(g.id)} />
                  </div>
                ))}
              </div>
              <AdminButton size="sm" variant="outline" icon="plus" onClick={addGalleryImage} style={{ marginTop: 10 }}>Bild hinzufügen</AdminButton>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="tag" n={3}>Projekt-Badges &amp; Highlights</SectionTitle>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--gray-mid)' }}>Diese Badges erscheinen auf der öffentlichen Projektkarte. Bitte kurz halten. Unabhängig vom aktuellen Produktkatalog.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {f.badges.map((b, i) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                  <Tag>{b.label}</Tag>
                  <span style={{ fontSize: 11.5, color: 'var(--gray-mid)', flex: 1 }}>{b.type}</span>
                  <button type="button" onClick={() => moveBadge(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--gray-400)' : 'var(--charcoal)' }}>▲</button>
                  <button type="button" onClick={() => moveBadge(i, 1)} disabled={i === f.badges.length - 1} style={{ background: 'none', border: 'none', cursor: i === f.badges.length - 1 ? 'default' : 'pointer', color: i === f.badges.length - 1 ? 'var(--gray-400)' : 'var(--charcoal)' }}>▼</button>
                  <IconAction icon={b.visible ? 'eye' : 'eyeoff'} label={b.visible ? 'Sichtbar' : 'Ausgeblendet'} onClick={() => toggleBadgeVisible(b.id)} />
                  <IconAction icon="x" label="Entfernen" tone="danger" onClick={() => removeBadge(b.id)} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}><TextInput value={newBadgeText} onChange={e => setNewBadgeText(e.target.value)} placeholder="z. B. 11,4 kWp" onKeyDown={e => { if (e.key === 'Enter') addBadge(); }} /></div>
              <div style={{ flex: '0 1 160px' }}><SelectInput value={newBadgeType} onChange={e => setNewBadgeType(e.target.value as BadgeType)}>{BADGE_TYPES.map(t => <option key={t}>{t}</option>)}</SelectInput></div>
              <AdminButton variant="outline" icon="plus" onClick={addBadge}>Badge hinzufügen</AdminButton>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="edit" n={4}>Beschreibung</SectionTitle>
            <Field label="Kurzbeschreibung für Projektkarte" required error={errors.shortDescription} hint={`${f.shortDescription.length}/180 Zeichen`}>
              <TextArea value={f.shortDescription} error={errors.shortDescription} maxLength={180} onChange={e => set('shortDescription', e.target.value)} placeholder="24 Module, Fronius Reserva Speicher und Sungrow Wallbox – vollständig integriert in die Hausautomation." />
            </Field>
            <div style={{ marginTop: 16 }}><Field label="Interner Hinweis (nie öffentlich sichtbar)"><TextArea value={f.internalNote} onChange={e => set('internalNote', e.target.value)} /></Field></div>
          </Card>

          <Card>
            <SectionTitle icon="eye" n={5}>Sichtbarkeit &amp; Ausspielung</SectionTitle>
            <div style={grid2}>
              <Field label="Status"><SelectInput value={f.status} onChange={e => set('status', e.target.value as ProjectInsightStatus)}><option>Entwurf</option><option>Veröffentlicht</option><option>Archiviert</option></SelectInput></Field>
              <Field label="Sortierung" hint="Niedrige Zahlen erscheinen weiter oben."><TextInput type="number" value={f.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></Field>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>Auf Seiten anzeigen</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([['landingPage', 'Landing Page'], ['aboutPage', 'Über uns'], ['projectOverview', 'Projekt-Einblicke Übersicht'], ['offerDetails', 'Angebotsdetailseiten'], ['internalOnly', 'Nur intern / nicht öffentlich anzeigen']] as const).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={f.visibility[key]} onChange={e => setVis(key, e.target.checked)} style={{ accentColor: 'var(--sage)' }} />{label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.featured} onChange={e => set('featured', e.target.checked)} style={{ accentColor: 'var(--sage)' }} />Hervorgehobenes Projekt
              </label>
            </div>
            <div style={{ ...grid2, marginTop: 16 }}>
              <Field label="Öffentlich sichtbar ab (optional)"><TextInput type="date" value={f.publishedFrom} onChange={e => set('publishedFrom', e.target.value)} /></Field>
              <Field label="Öffentlich sichtbar bis (optional)"><TextInput type="date" value={f.publishedUntil} onChange={e => set('publishedUntil', e.target.value)} /></Field>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: w > 1080 ? 'sticky' : 'static', top: 20 }}>
          <Card>
            <SectionTitle icon="search" n={6}>Vorschau</SectionTitle>
            <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: 130, background: 'var(--sage)' }}>
                {f.mainImage ? <img src={f.mainImage} alt={f.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 700 }}>Projekt-Einblick · {f.locationLabel || '…'}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', marginTop: 3 }}>{f.title || 'Projekt-Titel'}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '8px 0' }}>{f.badges.filter(b => b.visible).map(b => <Tag key={b.id}>{b.label}</Tag>)}</div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--gray-mid)', lineHeight: 1.5 }}>{f.shortDescription || 'Kurzbeschreibung fehlt.'}</p>
              </div>
            </div>
            {warnings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {warnings.map((wn, i) => <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#c79400' }}><Icon name="alert" size={13} style={{ marginTop: 1, flex: 'none' }} />{wn}</div>)}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AdminButton size="lg" variant="primary" icon="check" disabled={saving} onClick={() => submit(f.status)} style={{ width: '100%' }}>Speichern</AdminButton>
              <AdminButton variant="outline" disabled={saving} onClick={() => submit('Entwurf')} style={{ width: '100%' }}>Als Entwurf speichern</AdminButton>
              <AdminButton variant="accent" icon="send" disabled={saving} onClick={() => submit('Veröffentlicht')} style={{ width: '100%' }}>Veröffentlichen</AdminButton>
              <AdminButton variant="ghost" onClick={() => navigate('/project-insights')} style={{ width: '100%' }}>Abbrechen</AdminButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
