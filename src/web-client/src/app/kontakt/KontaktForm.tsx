'use client';

/* eslint-disable @next/next/no-img-element */
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { getOfferBySlug, offers } from '@/lib/mockData';
import { computeSystem, euro, mainComponentsList, num } from '@/lib/offerCalc';
import { submitContactRequest } from '@/lib/contactRequest';
import type { ContactRequestPayload, RequestMode } from '@/lib/types';

const consultationBullets = ['Persönliche Rückmeldung', 'Unverbindliche Ersteinschätzung', 'Beratung zu PV, Speicher und Wallbox', 'Regional im Rhein-Main-Gebiet'];
const generalBullets = ['PV-Anlage planen', 'Paket prüfen lassen', 'Speicher oder Wallbox ergänzen', 'Allgemeine Beratung'];

const NOT_SET = 'Noch nicht angegeben';

export function KontaktForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent') || 'generalContact';
  const offerSlug = searchParams.get('offer');
  const offer = offerSlug ? getOfferBySlug(offerSlug) : undefined;

  const isPackageCard = intent === 'offerPackage' && !!offer;
  const isSimulationCard = intent === 'simulationIndividual' || intent === 'simulationPackage';
  const isConsultationCard = intent === 'freeConsultation';
  const isProductCard = intent === 'productQuestion';
  const isKnowledgeCard = intent === 'knowledgeQuestion';

  const pkgCard = isPackageCard && offer
    ? {
        title: offer.title,
        badge: offer.badge,
        image: offer.previewImageUrl,
        pvLabel: (() => { const sys = computeSystem(offer.mainProducts); return sys.pvPowerKwp ? num(sys.pvPowerKwp, 1) + ' kWp' : NOT_SET; })(),
        moduleLabel: (() => { const sys = computeSystem(offer.mainProducts); return sys.moduleCount ? sys.moduleCount + ' Module' : NOT_SET; })(),
        storageLabel: (() => { const sys = computeSystem(offer.mainProducts); return sys.storageCapacityKwh ? num(sys.storageCapacityKwh, 1) + ' kWh Speicher' : 'ohne Speicher'; })(),
        priceLabel: offer.priceType === 'on_request' ? 'Auf Anfrage' : offer.priceType === 'starting_from' ? 'ab ' + euro(offer.priceAmount) : euro(offer.priceAmount),
        components: mainComponentsList(offer).slice(0, 4),
      }
    : null;

  const kontaktTitle = isPackageCard ? 'Paket unverbindlich prüfen lassen'
    : isSimulationCard ? 'Simulation unverbindlich prüfen lassen'
    : isConsultationCard ? 'Kostenlose Beratung anfragen'
    : isProductCard ? 'Beratung zu Komponenten anfragen'
    : isKnowledgeCard ? 'Frage zum Wissensbereich'
    : 'Wie können wir helfen?';
  const kontaktSubtitle = isPackageCard ? 'Wir prüfen, ob dieses Paket zu Ihrem Haus passt. Senden Sie uns wenige Angaben – wir melden uns persönlich zurück und besprechen die nächsten Schritte.'
    : isSimulationCard ? 'Ihre Simulationswerte wurden übernommen. Wir prüfen gemeinsam, ob die Werte rechnerisch zu Ihrem Haus passen – unverbindlich und ohne technische Prüfung.'
    : isConsultationCard ? 'Zur gemeinsamen Prüfung Ihrer individuellen Anfrage. Wir melden uns persönlich zurück und besprechen, welche PV-Lösung zu Ihrem Dach, Verbrauch und Ihren Plänen passt.'
    : isProductCard ? 'Wir prüfen gerne, welche Komponente zu Ihrem Projekt passt.'
    : 'Senden Sie uns Ihre Anfrage. Wir melden uns persönlich zurück und besprechen die nächsten Schritte.';
  const kontaktCta = isPackageCard ? 'Paket unverbindlich prüfen lassen'
    : isSimulationCard ? 'Simulation unverbindlich prüfen lassen'
    : isConsultationCard ? 'Kostenlose Beratung anfragen'
    : isProductCard ? 'Beratung zu Komponenten anfragen'
    : 'Anfrage unverbindlich senden';

  const showPaketField = !isSimulationCard;
  const showPaketSelect = showPaketField && !isPackageCard;
  const paketOptions = ['Individuelle Anfrage', ...offers.map((o) => o.title)];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [paket, setPaket] = useState(isPackageCard && offer ? offer.title : 'Individuelle Anfrage');
  const [consumption, setConsumption] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [roofPhotoName, setRoofPhotoName] = useState('');
  const [meterPhotoName, setMeterPhotoName] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitForm() {
    if (!name || !email || !phone || !zip || !city || !consent) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setSubmitting(true);

    const requestMode: RequestMode = isPackageCard ? 'offerPackage'
      : isSimulationCard ? 'simulationIndividual'
      : isConsultationCard ? 'freeConsultation'
      : isProductCard ? 'productQuestion'
      : isKnowledgeCard ? 'knowledgeQuestion'
      : 'generalContact';

    const payload: ContactRequestPayload = {
      requestMode,
      inquiryType: kontaktTitle,
      inquiryTypeKey: intent,
      kunde: { name, email, phone, postalCode: zip, city, street: street || undefined, preferredContactTime: desiredDate || undefined },
      additionalCustomerInputs: {
        annualConsumptionKwh: consumption ? Number(consumption) : null,
        preferredContactTime: desiredDate || undefined,
        topic: showPaketSelect ? paket : offer?.title,
        notes: message || undefined,
      },
      message: message || undefined,
      anfrageweg: { source: 'web-client', sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined, submittedAt: new Date().toISOString() },
      anfrageSnapshot: isPackageCard && offer ? { offerSlug: offer.slug, offerTitle: offer.title } : undefined,
      consent: { privacyAccepted: consent, privacyAcceptedAt: new Date().toISOString() },
    };

    await submitContactRequest(payload);

    const summary = isPackageCard && offer ? `Ihre Anfrage zu „${offer.title}" ist bei uns eingegangen.`
      : isSimulationCard ? 'Ihre Simulationswerte wurden übernommen.'
      : isProductCard ? 'Ihre Anfrage zu Komponenten ist bei uns eingegangen.'
      : '';

    setSubmitting(false);
    router.push(`/danke${summary ? `?summary=${encodeURIComponent(summary)}` : ''}`);
  }

  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 24px 0' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{kontaktTitle}</h1>
        <p style={{ margin: '0 0 34px', fontSize: 'var(--text-p4)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', maxWidth: 640 }}>{kontaktSubtitle}</p>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 90px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26, alignItems: 'flex-start' }}>
          {/* CONTEXT CARD */}
          <aside style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 400, background: 'var(--cream)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', position: 'sticky', top: 96 }}>
            {isPackageCard && pkgCard && (
              <>
                <div style={{ aspectRatio: '16 / 10', background: 'var(--sage)', overflow: 'hidden' }}>
                  <img src={pkgCard.image} alt={pkgCard.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '20px 22px 22px' }}>
                  <div style={{ fontSize: 'var(--text-p7)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em' }}>Sie fragen dieses Paket an</div>
                  <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, margin: '4px 0 8px', lineHeight: 'var(--lh-snug)' }}>{pkgCard.title}</div>
                  {pkgCard.badge && <span style={{ display: 'inline-flex', marginBottom: 10, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--yellow)', color: 'var(--charcoal)', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.badge}</span>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.28)', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.pvLabel}</span>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.28)', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.moduleLabel}</span>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.28)', fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.storageLabel}</span>
                  </div>
                  {pkgCard.components.map((c) => (
                    <div key={c.slotKey} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', marginBottom: 6 }}>
                      <div style={{ width: 28, height: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {c.hasLogo && <img src={c.logo} alt={c.manufacturer} style={{ maxWidth: 24, maxHeight: 16, objectFit: 'contain' }} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1, fontSize: 'var(--text-p7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <span style={{ flex: 'none', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>{c.qtyLabel}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.priceLabel}</div>
                  <p style={{ margin: '12px 0 0', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>Wir prüfen, ob dieses Paket zu Ihrem Dach und Ihrer technischen Situation passt.</p>
                </div>
              </>
            )}

            {isSimulationCard && (
              <div style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Ihre individuelle Anfrage</div>
                <p style={{ margin: '14px 0 0', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>
                  Kein festes Paket ausgewählt – wir prüfen Ihre individuellen Werte aus dem PV-Simulator gemeinsam mit Ihnen.
                </p>
              </div>
            )}

            {isConsultationCard && (
              <div style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 4 }}>Kostenfreie Kontaktaufnahme</div>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)' }}>Zur gemeinsamen Prüfung Ihrer individuellen Anfrage.</p>
                <p style={{ margin: '0 0 16px', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>Wir melden uns persönlich zurück und besprechen, welche PV-Lösung zu Ihrem Dach, Verbrauch und Ihren Plänen passt.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {consultationBullets.map((b) => (
                    <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 'var(--text-p6)' }}><span style={{ color: 'var(--sage)' }}>✓</span>{b}</div>
                  ))}
                </div>
              </div>
            )}

            {isProductCard && (
              <div style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 12 }}>Beratung zu Komponenten</div>
                <p style={{ margin: '14px 0 0', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>Wir prüfen gerne, welche Komponente zu Ihrem Projekt passt.</p>
              </div>
            )}

            {!isPackageCard && !isSimulationCard && !isConsultationCard && !isProductCard && (
              <div style={{ padding: '22px 24px' }}>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 8 }}>Wie können wir helfen?</div>
                <p style={{ margin: '0 0 16px', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>Senden Sie uns Ihre Anfrage. Wir melden uns persönlich zurück und besprechen die nächsten Schritte.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {generalBullets.map((b) => (
                    <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 'var(--text-p6)' }}><span style={{ color: 'var(--sage)' }}>✓</span>{b}</div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* FORM */}
          <div style={{ flex: '2 1 480px', minWidth: 320, background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-lg)', padding: '32px 34px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihre Kontaktdaten</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label required>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
              </div>
              <div>
                <Label required>E-Mail</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.de" />
              </div>
              <div>
                <Label required>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0170 1234567" />
              </div>
              <div>
                <Label required>PLZ</Label>
                <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="63322" />
              </div>
              <div>
                <Label required>Ort</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Rödermark" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Straße &amp; Hausnummer <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional)</span></Label>
                <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Straße & Hausnummer" />
              </div>
            </div>

            {showPaketField && (
              <>
                <h2 style={{ margin: '30px 0 14px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihr Paket</h2>
                {isPackageCard && pkgCard ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                    <span style={{ color: 'var(--sage)', fontSize: 18 }}>✓</span>
                    <span style={{ fontSize: 'var(--text-p5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{pkgCard.title}</span>
                  </div>
                ) : showPaketSelect ? (
                  <select value={paket} onChange={(e) => setPaket(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-p5)', color: 'var(--charcoal)', background: 'var(--gray-300)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', outline: 'none' }}>
                    {paketOptions.map((po) => (
                      <option key={po} value={po}>{po}</option>
                    ))}
                  </select>
                ) : null}
              </>
            )}

            <h2 style={{ margin: '30px 0 4px', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Weitere Angaben</h2>
            <p style={{ margin: '0 0 18px', fontSize: 'var(--text-p6)', color: 'var(--gray-mid)' }}>Alles optional – hilft uns aber bei der Vorbereitung.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Jahresstromverbrauch <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional, kWh)</span></Label>
                <Input value={consumption} onChange={(e) => setConsumption(e.target.value)} placeholder="z. B. 5000" />
              </div>
              <div>
                <Label>Wunschtermin <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional)</span></Label>
                <Input value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} placeholder="z. B. Dienstagvormittag" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <Label>Dachfoto <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional)</span></Label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1.5px dashed var(--gray-500)', borderRadius: 'var(--radius-md)', padding: 20, cursor: 'pointer', background: 'var(--gray-300)', textAlign: 'center' }}>
                  <span style={{ fontSize: 22 }}>📎</span>
                  <span style={{ fontSize: 'var(--text-p6)', color: 'var(--charcoal)' }}>{roofPhotoName || 'Foto auswählen'}</span>
                  <input type="file" accept="image/*" onChange={(e) => setRoofPhotoName(e.target.files?.[0]?.name || '')} style={{ display: 'none' }} />
                </label>
              </div>
              <div>
                <Label>Zählerschrankfoto <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional)</span></Label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1.5px dashed var(--gray-500)', borderRadius: 'var(--radius-md)', padding: 20, cursor: 'pointer', background: 'var(--gray-300)', textAlign: 'center' }}>
                  <span style={{ fontSize: 22 }}>📎</span>
                  <span style={{ fontSize: 'var(--text-p6)', color: 'var(--charcoal)' }}>{meterPhotoName || 'Foto auswählen'}</span>
                  <input type="file" accept="image/*" onChange={(e) => setMeterPhotoName(e.target.files?.[0]?.name || '')} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Label>Nachricht <span style={{ color: 'var(--gray-mid)', fontWeight: 'var(--fw-book)' as unknown as number }}>(optional)</span></Label>
              <Input multiline rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Erzählen Sie uns von Ihrem Dach, Ihren Wünschen oder Fragen…" />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 26, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--sage)', marginTop: 2, flex: 'none' }} />
              <span>Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. (Datenschutz) *</span>
            </label>
            {formError && <p style={{ margin: '12px 0 0', fontSize: 'var(--text-p6)', color: '#c0564a' }}>Bitte füllen Sie alle Pflichtfelder (*) aus und stimmen Sie der Datenschutzerklärung zu.</p>}

            <div style={{ marginTop: 26 }}>
              <Button variant="solid" tone="ink" size="lg" onClick={submitForm} disabled={submitting}>{submitting ? 'Wird gesendet…' : kontaktCta}</Button>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)' }}>Unverbindlich. Wir prüfen gemeinsam mit Ihnen die nächsten Schritte.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
