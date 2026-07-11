import { useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AdminButton } from '../../components/ui/Button';
import { SelectInput, TextArea } from '../../components/ui/Fields';
import { fmtDate } from '../../lib/utils';
import { contactRequestsApi } from '../../api/contactRequests';
import { useToast } from '../../lib/ToastContext';
import type { ContactRequest, Employee, RequestStatus } from '../../types';

const STATUS_ACTIONS: { status: RequestStatus; label: string }[] = [
  { status: 'Gelesen', label: 'Als gelesen markieren' },
  { status: 'In Bearbeitung', label: 'In Bearbeitung setzen' },
  { status: 'To-do', label: 'Auf To-do setzen' },
  { status: 'Beantwortet', label: 'Als beantwortet markieren' },
  { status: 'Erledigt', label: 'Als erledigt markieren' },
];

const NA = <span style={{ color: 'var(--gray-mid)' }}>Noch nicht angegeben</span>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--gray-400)', padding: '16px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: 'var(--gray-mid)' }}>{label}</span>
      <span style={{ color: 'var(--charcoal)', fontWeight: 600, textAlign: 'right' }}>{value ?? NA}</span>
    </div>
  );
}
function fmt(v: unknown, unit = ''): ReactNode {
  if (v === undefined || v === null || v === '') return NA;
  if (typeof v === 'number') return `${v.toLocaleString('de-DE')}${unit}`;
  if (typeof v === 'boolean') return v ? 'Ja' : 'Nein';
  return String(v);
}

export function ContactRequestDetail({ request, employees, onChanged }: {
  request: ContactRequest;
  employees: Employee[];
  onChanged: (updated: ContactRequest) => void;
}) {
  const { pushToast } = useToast();
  const [noteText, setNoteText] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [pickedEmployee, setPickedEmployee] = useState('');
  const snap = request.anfrageSnapshot || {};
  const eco = request.wirtschaftlichkeitsrechnung;

  async function setStatus(status: RequestStatus) {
    const updated = await contactRequestsApi.setStatus(request.id, status);
    onChanged(updated);
    pushToast('success', `Status geändert: ${status}`);
  }
  async function archive() {
    onChanged(await contactRequestsApi.archive(request.id));
    pushToast('success', 'Anfrage archiviert');
  }
  async function trash() {
    if (!confirm('Diese Anfrage in den Papierkorb verschieben?')) return;
    onChanged(await contactRequestsApi.trash(request.id));
    pushToast('success', 'Anfrage in den Papierkorb verschoben');
  }
  async function assign() {
    if (!pickedEmployee) return;
    const res = await contactRequestsApi.assign(request.id, pickedEmployee);
    onChanged(res);
    setAssigning(false);
    if (res.emailOk) pushToast('success', 'Anfrage zugewiesen und Mitarbeiter benachrichtigt');
    else pushToast('error', 'Die Anfrage wurde zugewiesen, aber die E-Mail-Benachrichtigung konnte nicht gesendet werden.');
  }
  async function addNote() {
    if (!noteText.trim()) return;
    const updated = await contactRequestsApi.addNote(request.id, noteText.trim());
    onChanged(updated);
    setNoteText('');
    pushToast('success', 'Notiz hinzugefügt');
  }

  const k = request.kunde;
  const ai = request.additionalCustomerInputs;
  const hasWeitereAngaben = ai && (ai.annualConsumptionKwh != null || ai.preferredContactTime || ai.desiredCallbackTime || ai.roofPhotoProvided != null || ai.meterCabinetPhotoProvided != null);

  return (
    <div>
      <Section title="Status & Verantwortung">
        <Row label="Status" value={request.status} />
        <Row label="Anfrageart" value={request.inquiryType} />
        <Row label="Erstellt" value={fmtDate(request.metainformationen?.createdAt) !== '—' ? fmtDate(request.metainformationen?.createdAt) : NA} />
        <Row label="Zugewiesen" value={request.admin.assignedTo ? `${request.admin.assignedTo.name} (${request.admin.assignedTo.role || '—'})` : 'Nicht zugewiesen'} />
        {request.admin.todo && <Row label="To-do" value={`${request.admin.todo.note || ''}${request.admin.todo.dueDate ? ` (fällig ${fmtDate(request.admin.todo.dueDate)})` : ''}`} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {STATUS_ACTIONS.map(a => (
            <button key={a.status} onClick={() => setStatus(a.status)} disabled={request.status === a.status}
              style={{ padding: '5px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--gray-500)', background: request.status === a.status ? 'var(--gray-400)' : 'var(--white)', fontSize: 11.5, fontWeight: 600, color: 'var(--charcoal)', cursor: request.status === a.status ? 'default' : 'pointer' }}>
              {a.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          {!assigning ? (
            <AdminButton size="sm" variant="outline" icon="user" onClick={() => setAssigning(true)}>Mitarbeiter zuweisen</AdminButton>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}>
                <SelectInput value={pickedEmployee} onChange={e => setPickedEmployee(e.target.value)}>
                  <option value="">— Mitarbeiter wählen —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
                </SelectInput>
              </div>
              <AdminButton size="sm" variant="primary" icon="send" onClick={assign}>Zuweisen &amp; benachrichtigen</AdminButton>
              <AdminButton size="sm" variant="ghost" onClick={() => setAssigning(false)}>Abbrechen</AdminButton>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <AdminButton size="sm" variant="outline" icon="archive" onClick={archive}>Archivieren</AdminButton>
          <AdminButton size="sm" variant="danger" icon="trash" onClick={trash}>Löschen</AdminButton>
        </div>
      </Section>

      <Section title="Kunde">
        <Row label="Name" value={k.name} />
        <Row label="E-Mail" value={k.email ? <a href={`mailto:${k.email}`} style={{ color: 'var(--charcoal)' }}>{k.email}</a> : NA} />
        <Row label="Telefon" value={k.phone ? <a href={`tel:${k.phone}`} style={{ color: 'var(--charcoal)' }}>{k.phone}</a> : NA} />
        <Row label="PLZ / Ort" value={k.postalCode || k.city ? `${k.postalCode || ''} ${k.city || ''}`.trim() : undefined} />
        {k.street && <Row label="Straße / Hausnummer" value={k.street} />}
        {k.preferredContactTime && <Row label="Bevorzugte Kontaktzeit" value={k.preferredContactTime} />}
      </Section>

      {hasWeitereAngaben && (
        <Section title="Weitere Angaben">
          <Row label="Jahresstromverbrauch" value={fmt(ai?.annualConsumptionKwh, ' kWh')} />
          <Row label="Wunschtermin" value={fmt(ai?.desiredCallbackTime || ai?.preferredContactTime)} />
          <Row label="Dachfoto" value={ai?.roofPhotoProvided ? 'Hochgeladen' : 'Nicht hochgeladen'} />
          <Row label="Zählerschrankfoto" value={ai?.meterCabinetPhotoProvided ? 'Hochgeladen' : 'Nicht hochgeladen'} />
        </Section>
      )}

      <Section title="Nachricht">
        <p style={{ margin: 0, fontSize: 13.5, color: request.message ? 'var(--charcoal)' : 'var(--gray-mid)', lineHeight: 1.55 }}>{request.message || 'Keine zusätzliche Nachricht angegeben.'}</p>
      </Section>

      <Section title="Anfrageweg">
        <Row label="Quelle" value={request.anfrageweg?.source} />
        <Row label="Ursprüngliche Seite" value={request.anfrageweg?.sourceUrl} />
        <Row label="CTA" value={request.anfrageweg?.ctaLabel} />
        <Row label="Zeitpunkt" value={request.anfrageweg?.submittedAt ? fmtDate(request.anfrageweg.submittedAt) : undefined} />
      </Section>

      {snap.offerSnapshot && (
        <Section title="Angefragtes Paket">
          <Row label="Titel" value={snap.offerSnapshot.title} />
          <Row label="Preis" value={snap.offerSnapshot.priceLabel || snap.offerSnapshot.price} />
          {snap.computedSystemSnapshot && <>
            <Row label="PV-Leistung" value={fmt(snap.computedSystemSnapshot.pvPowerKwp, ' kWp')} />
            <Row label="Module" value={fmt(snap.computedSystemSnapshot.moduleCount)} />
            <Row label="Speicher" value={fmt(snap.computedSystemSnapshot.storageCapacityKwh, ' kWh')} />
          </>}
        </Section>
      )}

      {snap.customConfigurationSnapshot && (
        <Section title="Individuelle Konfiguration">
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--gray-mid)' }}>Vom Kunden übermittelte Anfrage-Daten</p>
          <Row label="Bezeichnung" value={snap.customConfigurationSnapshot.title} />
          <Row label="Manuell angepasst" value={fmt(snap.customConfigurationSnapshot.manuallyAdjusted)} />
        </Section>
      )}

      {Array.isArray(snap.productsSnapshot) && snap.productsSnapshot.length > 0 && (
        <Section title="Produkte">
          {snap.productsSnapshot.map((p, i: number) => (
            <Row key={i} label={p.selectedSlot || p.category} value={`${p.name}${p.quantity ? ` (${p.quantity}×)` : ''}`} />
          ))}
        </Section>
      )}

      {snap.simulatorInputSnapshot && (
        <Section title="Simulation">
          <Row label="Jahresstromverbrauch" value={fmt(snap.simulatorInputSnapshot.annualConsumptionKwh, ' kWh')} />
          <Row label="Paket" value={snap.simulatorInputSnapshot.selectedPackageTitle} />
          <Row label="PV-Leistung" value={fmt(snap.simulatorInputSnapshot.pvPowerKwp, ' kWp')} />
          <Row label="Speicher" value={fmt(snap.simulatorInputSnapshot.storageCapacityKwh, ' kWh')} />
          <Row label="Manuell angepasst" value={fmt(snap.simulatorInputSnapshot.manuallyAdjusted)} />
        </Section>
      )}

      {snap.roofAndAddressSnapshot && (
        <Section title="Dachcheck / Adresse">
          <Row label="Adresse angegeben" value={fmt(snap.roofAndAddressSnapshot.addressEntered)} />
          <Row label="Status" value={snap.roofAndAddressSnapshot.roofCheckStatus} />
          <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--gray-mid)' }}>Unverbindlich · voraussichtlich · ersetzt keine technische Vor-Ort-Prüfung.</p>
        </Section>
      )}

      {snap.selectedProductSnapshot && (
        <Section title="Produktberatung">
          <Row label="Produkt" value={snap.selectedProductSnapshot.name} />
          <Row label="Hersteller" value={snap.selectedProductSnapshot.manufacturer} />
          <Row label="Leistung" value={fmt(snap.selectedProductSnapshot.power, ` ${snap.selectedProductSnapshot.unit || ''}`)} />
        </Section>
      )}

      {snap.knowledgeTopicSnapshot && (
        <Section title="Wissen-Thema">
          <Row label="Thema" value={snap.knowledgeTopicSnapshot.title} />
        </Section>
      )}

      {snap.freeConsultationSnapshot && (
        <Section title="Kostenfreie Kontaktaufnahme">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--charcoal)' }}>{snap.freeConsultationSnapshot.label}</p>
        </Section>
      )}

      {eco && (
        <Section title="Wirtschaftlichkeitsrechnung">
          <p style={{ margin: '0 0 8px', fontSize: 11.5, color: 'var(--gray-mid)' }}>
            {eco.source === 'customerSimulation' ? 'Vom Kunden genutzte Simulation · rechnerisch · unverbindlich'
              : eco.source === 'packageDefault' ? 'Beispielrechnung aus Paket · nicht vom Kunden simuliert'
              : eco.source === 'offerDefault' ? 'Beispielrechnung aus Angebotsseite · nicht vom Kunden simuliert' : ''}
          </p>
          {eco.calculated && <>
            <Row label="Eigenverbrauch" value={fmt(eco.calculated.eigenverbrauch != null ? Math.round(eco.calculated.eigenverbrauch * 100) : null, '%')} />
            <Row label="Autarkiegrad" value={fmt(eco.calculated.autarkiegrad != null ? Math.round(eco.calculated.autarkiegrad * 100) : null, '%')} />
            <Row label="Mögliche jährliche Ersparnis" value={fmt(eco.calculated.yearlySavings, ' €')} />
            <Row label="Amortisation" value={fmt(eco.calculated.amortizationYears, ' Jahre')} />
          </>}
        </Section>
      )}

      {request.attachments.length > 0 && (
        <Section title="Anhänge">
          {request.attachments.map(a => (
            <Row key={a.id} label={a.type} value={<a href={a.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--charcoal)' }}>{a.fileName}</a>} />
          ))}
        </Section>
      )}

      <Section title="Datenschutz">
        <Row label="Zustimmung" value={fmt(request.consent.privacyAccepted)} />
        <Row label="Zeitpunkt" value={request.consent.privacyAcceptedAt ? fmtDate(request.consent.privacyAcceptedAt) : undefined} />
      </Section>

      <Section title="Interne Notizen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {request.admin.internalNotes.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--gray-mid)' }}>Noch keine internen Notizen.</p>}
          {request.admin.internalNotes.map(n => (
            <div key={n.id} style={{ background: 'var(--gray-300)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <div style={{ fontSize: 12.5, color: 'var(--charcoal)' }}>{n.text}</div>
              <div style={{ fontSize: 10.5, color: 'var(--gray-mid)', marginTop: 3 }}>{n.authorName} · {fmtDate(n.createdAt)}</div>
            </div>
          ))}
        </div>
        <TextArea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Interne Notiz hinzufügen…" style={{ minHeight: 60 }} />
        <AdminButton size="sm" variant="outline" icon="plus" onClick={addNote} style={{ marginTop: 8 }}>Notiz hinzufügen</AdminButton>
      </Section>

      <Section title="Verlauf">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...request.admin.activityLog].reverse().map(l => (
            <div key={l.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12 }}>
              <span style={{ color: 'var(--sage)', flex: 'none', marginTop: 2 }}><Icon name="clock" size={12} /></span>
              <div>
                <span style={{ color: 'var(--charcoal)', fontWeight: 600 }}>{l.action}</span>
                {l.metadata && <span style={{ color: 'var(--gray-mid)' }}> — {l.metadata}</span>}
                <div style={{ color: 'var(--gray-mid)' }}>{l.actorName} · {fmtDate(l.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
