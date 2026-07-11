// Ported from the Claude Design prototype's lebe-offer-model.js (offers /
// catalog / templates) and lebe-data.js (products catalog superset).
// Mock only — no network calls. Swap for real fetch() calls against the
// admin API in a later step.

import type {
  CatalogProduct,
  ComponentTemplate,
  FaqEntry,
  Offer,
  OfferPriceType,
  Product,
  ProcessStep,
  RequirementTemplate,
  ServiceTemplate,
} from './types';

const A = '/assets/';

export const catalog: Record<string, CatalogProduct> = {
  'PV-1671': { productId: 'PV-1671', category: 'Solarmodule', manufacturer: 'Aiko', name: 'AIKO Neostar 3S+ 475 W', power: 475, unit: 'W', warranty: '30 Jahre Produkt & Leistung', panelHeightMeters: 1.905, panelWidthMeters: 1.134, specPdf: 'AIKO-Neostar-3S-Datenblatt.pdf', logo: A + 'brands/aiko_logo.svg', image: A + 'products/aiko-neostar.png', beschreibung: 'Hocheffizientes ABC-Glas-Glas-Modul mit hervorragendem Schwachlichtverhalten.' },
  'PV-2210': { productId: 'PV-2210', category: 'Solarmodule', manufacturer: 'Bauer', name: 'Bauer BS-6MHB10 440 W', power: 440, unit: 'W', warranty: '30 Jahre', panelHeightMeters: 1.762, panelWidthMeters: 1.134, specPdf: 'Bauer-BS-6MHB10-Datenblatt.pdf', logo: A + 'brands/logo_bauer.svg', image: A + 'products/bauer-440.jpg', beschreibung: 'Deutsches Glas-Glas-Modul mit langlebiger Doppelglas-Konstruktion.' },
  'WR-8': { productId: 'WR-8', category: 'Wechselrichter', manufacturer: 'Fronius', name: 'Fronius Symo GEN24 10.0 Plus', power: 10, unit: 'kW', warranty: '10 Jahre (nach Registrierung)', specPdf: 'Fronius-GEN24-Plus-Datenblatt.pdf', logo: A + 'brands/logo_fronius.webp', image: A + 'products/solaredge-controller.png', hybrid: true, beschreibung: 'Hybridwechselrichter mit Notstromfunktion (PV Point).' },
  'WR-10': { productId: 'WR-10', category: 'Wechselrichter', manufacturer: 'Sungrow', name: 'Sungrow SH8.0RT', power: 8, unit: 'kW', warranty: '10 Jahre', specPdf: 'Sungrow-SH-RT-Datenblatt.pdf', logo: A + 'brands/logo_sungrow.png', image: A + 'products/solaredge-controller.png', hybrid: true, beschreibung: 'Dreiphasiger Hybridwechselrichter für Speichernachrüstung.' },
  'WR-5999': { productId: 'WR-5999', category: 'Wechselrichter', manufacturer: 'SMA', name: 'SMA Sunny Tripower 50-41 CORE1', power: 50, unit: 'kW', warranty: '5 Jahre', specPdf: 'SMA-Sunny-Tripower-CORE1-Datenblatt.pdf', logo: A + 'brands/logo_sma.svg', image: A + 'products/solaredge-controller.png', beschreibung: 'Freistehender Gewerbe-Wechselrichter für große Dachanlagen.' },
  'SP-121': { productId: 'SP-121', category: 'Heimspeicher', manufacturer: 'Fronius', name: 'Fronius Reserva 9,5', power: 9.5, unit: 'kWh', warranty: '10 Jahre', specPdf: 'Fronius-Reserva-Datenblatt.pdf', logo: A + 'brands/logo_fronius.webp', image: A + 'products/fronius-reserva.png', beschreibung: 'Modularer Hochvolt-Speicher, perfekt zum GEN24 passend.' },
  'SP-9201': { productId: 'SP-9201', category: 'Heimspeicher', manufacturer: 'SENEC', name: 'SENEC.Home P4', power: 10.65, unit: 'kWh', warranty: '10 Jahre / 10.000 Zyklen', specPdf: 'SENEC-Home-P4-Datenblatt.pdf', logo: A + 'brands/logo_senec.svg', image: A + 'products/senec-home-e4.png', beschreibung: 'All-in-One-Speichersystem mit integriertem Wechselrichter & App.' },
  'LS-2001': { productId: 'LS-2001', category: 'Ladestationen', manufacturer: 'Sungrow', name: 'Sungrow EV Charger 11 kW', power: 11, unit: 'kW', warranty: '5 Jahre', specPdf: 'Sungrow-EV-Charger-Datenblatt.pdf', logo: A + 'brands/logo_sungrow.png', image: A + 'products/solaredge-controller.png', beschreibung: 'PV-optimierte Wallbox mit Überschussladen.' },
  'HZ-500': { productId: 'HZ-500', category: 'Heizsysteme', manufacturer: 'LG', name: 'LG Therma V R290 Wärmepumpe', power: 9, unit: 'kW', warranty: '5 Jahre', specPdf: 'LG-ThermaV-Datenblatt.pdf', logo: '', image: A + 'images/individuell_offer.png', beschreibung: 'Effiziente Luft-Wasser-Wärmepumpe für Neubau und Sanierung.' },
};

export const serviceTemplates: ServiceTemplate[] = [
  { id: 'srv-beratung', name: 'Persönliche Beratung', category: 'Planung', publicDescription: 'Vor-Ort- oder Online-Beratung durch unser Fachteam.', descriptionLines: ['Individuelle Bedarfsanalyse für Ihr Dach', 'Persönlicher Ansprechpartner von Anfang an'], taxRelevantForCraftsmanWork: false, visibility: 'public', included: true },
  { id: 'srv-planung', name: 'Anlagenplanung & Ertragsauslegung', category: 'Planung', publicDescription: 'Technische Auslegung Ihrer Anlage inkl. Ertragsprognose.', descriptionLines: ['Modulbelegung & Verschattungsanalyse', 'Wirtschaftlichkeits- und Ertragsberechnung'], taxRelevantForCraftsmanWork: false, visibility: 'public', included: true },
  { id: 'srv-lieferung', name: 'Lieferung frei Baustelle', category: 'Logistik', publicDescription: 'Anlieferung aller Komponenten direkt zu Ihnen.', descriptionLines: ['Komplette PV-Anlage frei Baustelle'], taxRelevantForCraftsmanWork: false, visibility: 'public', included: true },
  { id: 'srv-geruest', name: 'Arbeitsschutzgerüst inkl. Absturzsicherung', category: 'Montage', publicDescription: 'Auf- und Abbau eines Arbeits- und Schutzgerüsts.', descriptionLines: ['Gemäß Unfallverhütungsvorschriften', 'Inkl. Absturzsicherung'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-montage', name: 'Modulmontage & DC-Verkabelung', category: 'Montage', publicDescription: 'Fachgerechte Montage der Module und DC-seitige Verkabelung.', descriptionLines: ['Modulmontage inkl. Unterkonstruktion', 'Leitung 6 mm² inkl. MC4-Stecksystem'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-elektro', name: 'AC-Elektroinstallation & Wechselrichter', category: 'Elektro', publicDescription: 'Installation des Wechselrichters und AC-Anbindung.', descriptionLines: ['Integration in den Zählerschrank', 'Anschluss & Konfiguration des Wechselrichters'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-speicher', name: 'Speicherintegration', category: 'Elektro', publicDescription: 'Anschluss und Inbetriebnahme des Energiespeichers.', descriptionLines: ['Anschluss des Batteriespeichers', 'Konfiguration des Energiemanagements'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-wallbox', name: 'Wallboxinstallation', category: 'Elektro', publicDescription: 'Installation und Anbindung Ihrer Wallbox.', descriptionLines: ['Elektrischer Anschluss der Wallbox', 'Einbindung ins Überschussladen'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-smartmeter', name: 'Smart-Meter-Integration', category: 'Elektro', publicDescription: 'Einbindung eines intelligenten Messsystems.', descriptionLines: ['Installation & Anbindung Smart Meter'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-anmeldung', name: 'Anmeldung beim Netzbetreiber', category: 'Verwaltung', publicDescription: 'Komplette Anmeldung und Registrierung Ihrer Anlage.', descriptionLines: ['Netzbetreiber- & Marktstammdaten-Anmeldung', 'Übermittlung aller Anlagendaten'], taxRelevantForCraftsmanWork: false, visibility: 'public', included: true },
  { id: 'srv-inbetrieb', name: 'Inbetriebnahme & Dokumentation', category: 'Abnahme', publicDescription: 'Prüfung, Inbetriebnahme und vollständige Dokumentation.', descriptionLines: ['Prüfung durch unsere Elektrofachkraft', 'Übergabeprotokoll & Anlagendokumentation'], taxRelevantForCraftsmanWork: true, visibility: 'public', included: true },
  { id: 'srv-einweisung', name: 'Einweisung & Monitoring-Einrichtung', category: 'Abnahme', publicDescription: 'Einweisung in Ihre Anlage und App-Einrichtung.', descriptionLines: ['Erklärung von Anlage & App', 'Einrichtung des Monitorings'], taxRelevantForCraftsmanWork: false, visibility: 'public', included: true },
];

export const componentTemplates: ComponentTemplate[] = [
  { id: 'cmp-smartmeter', name: 'Smart Meter (iMSys)', category: 'Messtechnik', unit: 'Stück', internalPrice: 180, publicLabel: 'Smart Meter', publicDescription: 'Intelligentes Messsystem für Echtzeit-Transparenz.', visibility: 'public', included: true, optional: false },
  { id: 'cmp-notstrom', name: 'Notstromumschalter', category: 'Elektro', unit: 'Stück', internalPrice: 320, publicLabel: 'Notstromfunktion', publicDescription: 'Versorgt wichtige Verbraucher bei Netzausfall.', visibility: 'public', included: true, optional: false },
  { id: 'cmp-backup', name: 'Backup Box', category: 'Elektro', unit: 'Stück', internalPrice: 690, publicLabel: 'Backup Box', publicDescription: 'Ersatzstromfähigkeit für das gesamte Hausnetz.', visibility: 'public', included: false, optional: true },
  { id: 'cmp-energiemanager', name: 'Energiemanager', category: 'Steuerung', unit: 'Stück', internalPrice: 240, publicLabel: 'Energiemanager', publicDescription: 'Intelligente Steuerung von Speicher, Wallbox & Verbrauch.', visibility: 'public', included: true, optional: false },
  { id: 'cmp-spd-ac', name: 'Überspannungsschutz AC (Typ 1+2+3)', category: 'Schutztechnik', unit: 'Stück', internalPrice: 210, publicLabel: 'Überspannungsschutz', publicDescription: 'Blitz- und Überspannungsschutz nach VDE.', visibility: 'public', included: true, optional: false },
  { id: 'cmp-spd-dc', name: 'Überspannungsschutz DC', category: 'Schutztechnik', unit: 'Stück', internalPrice: 150, publicLabel: '', publicDescription: '', visibility: 'internal', included: true, optional: false },
  { id: 'cmp-unterkonstruktion', name: 'Unterkonstruktion & Montageschienen', category: 'Montagematerial', unit: 'Set', internalPrice: 640, publicLabel: '', publicDescription: '', visibility: 'internal', included: true, optional: false },
  { id: 'cmp-dachhaken', name: 'Dachhaken', category: 'Montagematerial', unit: 'Stück', internalPrice: 210, publicLabel: '', publicDescription: '', visibility: 'internal', included: true, optional: false },
  { id: 'cmp-solarkabel', name: 'Solarkabel & MC4-Stecker', category: 'Verkabelung', unit: 'Set', internalPrice: 180, publicLabel: '', publicDescription: '', visibility: 'internal', included: true, optional: false },
  { id: 'cmp-zaehlermat', name: 'Zählerschrankmaterial & Sicherungen', category: 'Elektro', unit: 'Set', internalPrice: 260, publicLabel: '', publicDescription: '', visibility: 'internal', included: true, optional: false },
  { id: 'cmp-datenlogger', name: 'Kommunikationsmodul / Datenlogger', category: 'Kommunikation', unit: 'Stück', internalPrice: 130, publicLabel: 'Monitoring', publicDescription: 'App-Zugriff auf Erzeugung, Verbrauch und Speicherstand.', visibility: 'public', included: true, optional: false },
];

export const requirementTemplates: RequirementTemplate[] = [
  { id: 'req-dach', title: 'Geeignete Dachfläche', description: 'Ausreichend tragfähige, weitgehend unverschattete Dachfläche.', type: 'requirement', visibility: 'public', priceType: 'included' },
  { id: 'req-zaehler', title: 'Zählerschrank nach aktueller Norm', description: 'Ein den aktuellen VDE-Anwendungsregeln entsprechender Zählerschrank.', type: 'requirement', visibility: 'public', priceType: 'included' },
  { id: 'req-internet', title: 'Internetverbindung', description: 'Für Monitoring und Anmeldung wird ein Internetzugang benötigt.', type: 'requirement', visibility: 'public', priceType: 'included' },
  { id: 'req-zugang', title: 'Zugang zu Dach & Zählerschrank', description: 'Zugänglichkeit für Montage und Elektroinstallation am Umsetzungstag.', type: 'requirement', visibility: 'public', priceType: 'included' },
  { id: 'req-pruefung', title: 'Technische Prüfung vor Umsetzung', description: 'Vor der Umsetzung erfolgt eine kostenlose technische Prüfung vor Ort.', type: 'requirement', visibility: 'public', priceType: 'included' },
  { id: 'opt-zaehler', title: 'Zählerschrank-Erneuerung', description: 'Falls Ihr Zählerschrank nicht der aktuellen Norm entspricht.', type: 'optionalAdditionalWork', visibility: 'public', priceType: 'onRequest' },
  { id: 'opt-geruest', title: 'Sondergerüst', description: 'Bei schwer zugänglichen Dächern oder besonderer Höhe.', type: 'optionalAdditionalWork', visibility: 'public', priceType: 'startingFrom', optionalPrice: 450 },
  { id: 'opt-kabel', title: 'Sehr lange Kabelwege', description: 'Bei großer Distanz zwischen Dach und Zählerschrank.', type: 'optionalAdditionalWork', visibility: 'public', priceType: 'onRequest' },
  { id: 'opt-kernbohrung', title: 'Zusätzliche Kernbohrungen', description: 'Falls für die Leitungsführung erforderlich.', type: 'optionalAdditionalWork', visibility: 'public', priceType: 'onRequest' },
  { id: 'opt-dach', title: 'Dachsanierung', description: 'Bei sanierungsbedürftiger Dacheindeckung.', type: 'optionalAdditionalWork', visibility: 'public', priceType: 'onRequest' },
];

export const sharedFaq: FaqEntry[] = [
  { q: 'Ist der Preis wirklich fix?', a: 'Ja. Der Komplettpreis ist ein Festpreis. Sollten nach der kostenlosen technischen Prüfung Zusatzarbeiten notwendig sein, besprechen wir diese vorab transparent und bieten sie separat an.' },
  { q: 'Wie lange dauert die Umsetzung?', a: 'Nach Auftragserteilung und technischer Prüfung erfolgt die Montage in der Regel innerhalb weniger Wochen. Die eigentliche Installation dauert meist 1–2 Tage.' },
  { q: 'Übernehmen Sie die Anmeldung?', a: 'Ja. Wir übernehmen die komplette Anmeldung beim Netzbetreiber sowie die Registrierung im Marktstammdatenregister.' },
  { q: 'Gibt es einen festen Ansprechpartner?', a: 'Ja. Sie haben von der Beratung bis zur Inbetriebnahme einen persönlichen Ansprechpartner aus der Region – ohne Subunternehmer.' },
];

export const sharedProcess: ProcessStep[] = [
  { step: '1', title: 'Anfrage', text: 'Sie fragen das Paket unverbindlich an.' },
  { step: '2', title: 'Technische Prüfung', text: 'Kostenlose Prüfung von Dach & Zählerschrank vor Ort.' },
  { step: '3', title: 'Festes Angebot', text: 'Sie erhalten Ihr finales Angebot inkl. eventueller Zusatzarbeiten.' },
  { step: '4', title: 'Montage', text: 'Schlüsselfertige Installation durch unser Team.' },
  { step: '5', title: 'Inbetriebnahme', text: 'Anmeldung, Einweisung und Übergabe Ihrer Anlage.' },
];

export const offerDisclaimer =
  'Diese Berechnung ist eine unverbindliche Beispielrechnung. Die tatsächliche Wirtschaftlichkeit hängt unter anderem von Dachausrichtung, Verschattung, Verbrauchsprofil, Strompreis, Inbetriebnahmezeitpunkt und technischer Auslegung ab.';

export const offers: Offer[] = [
  {
    id: 'ANG-2026-011', slug: 'senec-all-in-one', title: 'SENEC All-in-One',
    subtitle: 'Höchste Autarkie mit Stromcloud-Option – alles drin, alles transparent.',
    badge: 'Stromcloud möglich', status: 'active', targetCustomer: 'Einfamilienhaus mit hohem Autarkiewunsch',
    designedFor: 'Einfamilienhäuser mit freier Dachfläche und Interesse an höchster Autarkie.',
    shortDescription: 'Eine leistungsstarke 13,3 kWp Anlage mit SENEC.Home P4 Speicher und Wallbox – als Rundum-sorglos-Paket ohne versteckte Kosten.',
    longDescription: 'Mit einer leistungsstarken 13,3 kWp Anlage aus AIKO Neostar 475 W Modulen und dem SENEC.Home P4 Speichersystem erzeugen Sie effizient Ihren eigenen Strom und steigern Ihren Eigenverbrauch deutlich. Dank Wallbox und Notstromfunktion erhalten Sie eines der zukunftssichersten Energiesysteme am Markt.',
    priceType: 'fixed', priceAmount: 19990, priceCurrency: 'EUR', priceLabel: 'Komplettpreis', taxNote: 'inkl. 0 % USt. (§ 12 Abs. 3 UStG für PV-Anlagen)',
    validUntil: '31.03.2026', publicUrl: 'lebe-solarenergie.de/angebot/senec-all-in-one', previewImageUrl: A + 'offers/Sungrow_Familien_Paket.png', allowChanges: false,
    mainProducts: { solarModule: { productId: 'PV-1671', quantity: 28 }, storage: { productId: 'SP-9201', quantity: 1 }, wallbox: { productId: 'LS-2001', quantity: 1 } },
    systemComponentIds: ['cmp-smartmeter', 'cmp-notstrom', 'cmp-energiemanager', 'cmp-spd-ac', 'cmp-datenlogger', 'cmp-spd-dc', 'cmp-unterkonstruktion', 'cmp-dachhaken', 'cmp-solarkabel', 'cmp-zaehlermat', 'cmp-backup'],
    serviceIds: ['srv-beratung', 'srv-planung', 'srv-lieferung', 'srv-geruest', 'srv-montage', 'srv-elektro', 'srv-speicher', 'srv-wallbox', 'srv-smartmeter', 'srv-anmeldung', 'srv-inbetrieb', 'srv-einweisung'],
    requirementIds: ['req-dach', 'req-zaehler', 'req-internet', 'req-zugang', 'req-pruefung', 'opt-zaehler', 'opt-geruest', 'opt-kabel', 'opt-kernbohrung', 'opt-dach'],
    economics: { enabled: true, annualConsumptionKwh: 6500, electricityPriceCentPerKwh: 31.89, specificYieldKwhPerKwp: 950, selfConsumptionRate: 0.48, autarkyRate: 0.68, feedInTariffCentPerKwh: 7.96, disclaimer: offerDisclaimer },
    faq: sharedFaq, process: sharedProcess,
  },
  {
    id: 'ANG-2026-014', slug: 'einfamilienhaus-premium', title: 'Einfamilienhaus Premium',
    subtitle: 'Komplettpaket mit Speicher – alles drin, alles transparent.',
    badge: 'Beliebt', status: 'active', targetCustomer: 'Einfamilienhaus, 3–5 Personen',
    designedFor: 'Einfamilienhäuser mit freier Dachfläche und Interesse an hoher Unabhängigkeit.',
    shortDescription: 'Ein schlüsselfertiges Solarpaket mit 24 Hochleistungsmodulen, Hybridwechselrichter und 9,5 kWh Speicher – regional geplant und montiert.',
    longDescription: 'Mit dem Paket „Einfamilienhaus Premium" erhalten Sie eine vollständig geplante und schlüsselfertig montierte Photovoltaikanlage. Wir übernehmen alles aus einer Hand – von der persönlichen Beratung über die Montage bis zur Anmeldung beim Netzbetreiber. Keine Subunternehmer, keine versteckten Kosten, ein fester Ansprechpartner aus der Region.',
    priceType: 'fixed', priceAmount: 18500, priceCurrency: 'EUR', priceLabel: 'Komplettpreis', taxNote: 'inkl. 0 % USt. (§ 12 Abs. 3 UStG für PV-Anlagen)',
    validUntil: '31.12.2026', publicUrl: 'lebe-solarenergie.de/angebot/einfamilienhaus-premium', previewImageUrl: A + 'offers/Einfamilienhaus.png', allowChanges: false,
    mainProducts: { solarModule: { productId: 'PV-1671', quantity: 24 }, inverter: { productId: 'WR-8', quantity: 1 }, storage: { productId: 'SP-121', quantity: 1 }, wallbox: { productId: 'LS-2001', quantity: 1 } },
    systemComponentIds: ['cmp-smartmeter', 'cmp-notstrom', 'cmp-energiemanager', 'cmp-spd-ac', 'cmp-datenlogger', 'cmp-spd-dc', 'cmp-unterkonstruktion', 'cmp-dachhaken', 'cmp-solarkabel', 'cmp-zaehlermat', 'cmp-backup'],
    serviceIds: ['srv-beratung', 'srv-planung', 'srv-lieferung', 'srv-geruest', 'srv-montage', 'srv-elektro', 'srv-speicher', 'srv-wallbox', 'srv-smartmeter', 'srv-anmeldung', 'srv-inbetrieb', 'srv-einweisung'],
    requirementIds: ['req-dach', 'req-zaehler', 'req-internet', 'req-zugang', 'req-pruefung', 'opt-zaehler', 'opt-geruest', 'opt-kabel', 'opt-kernbohrung', 'opt-dach'],
    economics: { enabled: true, annualConsumptionKwh: 6000, electricityPriceCentPerKwh: 31.89, specificYieldKwhPerKwp: 950, selfConsumptionRate: 0.42, autarkyRate: 0.62, feedInTariffCentPerKwh: 7.96, disclaimer: offerDisclaimer },
    faq: sharedFaq, process: sharedProcess,
  },
  {
    id: 'ANG-2026-021', slug: 'reihenmittelhaus', title: 'Reihenmittelhaus',
    subtitle: 'Kompaktanlage – Speicher & Wallbox jederzeit nachrüstbar.',
    badge: 'Nachrüstbar', status: 'active', targetCustomer: 'Reihenmittelhaus mit begrenzter Dachfläche',
    designedFor: 'Reihenmittelhäuser mit begrenzter Dachfläche, die flexibel bleiben möchten.',
    shortDescription: 'Eine optimal abgestimmte 7,6 kWp Anlage mit 16 Modulen. Speicher und Wallbox lassen sich jederzeit nachrüsten.',
    longDescription: 'Eine optimal auf das Reihenmittelhaus abgestimmte Anlage mit 16 leistungsstarken 475-Watt-Modulen. Bewusst modular geplant: ein Batteriespeicher sowie eine Wallbox lassen sich jederzeit problemlos nachrüsten. So investieren Sie genau dann, wenn es für Sie sinnvoll ist.',
    priceType: 'fixed', priceAmount: 9950, priceCurrency: 'EUR', priceLabel: 'Komplettpreis', taxNote: 'inkl. 0 % USt. (§ 12 Abs. 3 UStG für PV-Anlagen)',
    validUntil: '31.12.2026', publicUrl: 'lebe-solarenergie.de/angebot/reihenmittelhaus', previewImageUrl: A + 'images/solar-panel.jpeg', allowChanges: false,
    mainProducts: { solarModule: { productId: 'PV-1671', quantity: 16 }, inverter: { productId: 'WR-10', quantity: 1 } },
    systemComponentIds: ['cmp-smartmeter', 'cmp-spd-ac', 'cmp-datenlogger', 'cmp-spd-dc', 'cmp-unterkonstruktion', 'cmp-dachhaken', 'cmp-solarkabel', 'cmp-zaehlermat'],
    serviceIds: ['srv-beratung', 'srv-planung', 'srv-lieferung', 'srv-geruest', 'srv-montage', 'srv-elektro', 'srv-anmeldung', 'srv-inbetrieb', 'srv-einweisung'],
    requirementIds: ['req-dach', 'req-zaehler', 'req-internet', 'req-zugang', 'req-pruefung', 'opt-zaehler', 'opt-kabel', 'opt-dach'],
    economics: { enabled: true, annualConsumptionKwh: 4500, electricityPriceCentPerKwh: 31.89, specificYieldKwhPerKwp: 950, selfConsumptionRate: 0.30, autarkyRate: 0.32, feedInTariffCentPerKwh: 7.96, disclaimer: offerDisclaimer },
    faq: sharedFaq, process: sharedProcess,
  },
  {
    id: 'ANG-2026-030', slug: 'photovoltaik-unternehmen', title: 'Photovoltaik für Unternehmen',
    subtitle: 'Wirtschaftlich & leistungsstark für Gewerbe- und Industriedächer.',
    badge: 'Gewerbe', status: 'active', targetCustomer: 'Unternehmen, Gewerbe- und Industriegebäude',
    designedFor: 'Unternehmen, Gewerbe- und Industriegebäude mit großer Dachfläche.',
    shortDescription: 'Eine leistungsstarke 52,25 kWp Anlage mit 110 Modulen – ideal für Gewerbe- und Industriegebäude mit hohem Eigenverbrauch.',
    longDescription: 'Eine leistungsstarke Anlage mit 110 hocheffizienten 475-Watt-Modulen. Ideal für Gewerbe-, Industrie- und Firmengebäude mit hohem Eigenverbrauch. Wir übernehmen die komplette Umsetzung – Planung, Elektroinstallation und Anmeldung beim Netzbetreiber inklusive Abnahme.',
    priceType: 'starting_from', priceAmount: 39900, priceCurrency: 'EUR', priceLabel: 'Komplettpreis', taxNote: 'zzgl. gesetzlicher USt.',
    validUntil: '31.12.2026', publicUrl: 'lebe-solarenergie.de/angebot/photovoltaik-unternehmen', previewImageUrl: A + 'images/hero-solar.jpeg', allowChanges: true,
    mainProducts: { solarModule: { productId: 'PV-1671', quantity: 110 }, inverter: { productId: 'WR-5999', quantity: 1 } },
    systemComponentIds: ['cmp-smartmeter', 'cmp-spd-ac', 'cmp-energiemanager', 'cmp-datenlogger', 'cmp-spd-dc', 'cmp-unterkonstruktion', 'cmp-solarkabel', 'cmp-zaehlermat'],
    serviceIds: ['srv-beratung', 'srv-planung', 'srv-lieferung', 'srv-geruest', 'srv-montage', 'srv-elektro', 'srv-smartmeter', 'srv-anmeldung', 'srv-inbetrieb', 'srv-einweisung'],
    requirementIds: ['req-dach', 'req-zaehler', 'req-internet', 'req-zugang', 'req-pruefung', 'opt-geruest', 'opt-kernbohrung', 'opt-dach'],
    economics: { enabled: true, annualConsumptionKwh: 45000, electricityPriceCentPerKwh: 28.5, specificYieldKwhPerKwp: 950, selfConsumptionRate: 0.55, autarkyRate: 0.50, feedInTariffCentPerKwh: 7.1, disclaimer: offerDisclaimer },
    faq: sharedFaq, process: sharedProcess,
  },
];

export const priceTypeLabel: Record<OfferPriceType, string> = {
  fixed: 'Festpreis',
  starting_from: 'Preis ab',
  indicative: 'Indikativer Paketpreis',
  on_request: 'Preis nach Prüfung',
};

// ---- Individual/custom offer (PV-Simulator default), from lebe-data.js ----
export const individuellOffer = {
  slug: 'individuelles-angebot',
  title: 'Individuelles Angebot',
  subtitle: 'Frei wählbare Komponenten für Ihre Photovoltaikanlage – wir beraten Sie gerne.',
  image: A + 'images/individuell_offer.png',
  designedFor: 'Nutzen Sie den PV-Simulator für eine erste Einschätzung Ihres Bedarfs.',
  description: 'Stellen Sie sich Ihr individuelles Solarpaket zusammen und erhalten Sie eine unverbindliche Ersteinschätzung zu Wirtschaftlichkeit und Autarkie. Nach Ihrer Anfrage prüfen wir die Planung und beraten Sie bei der finalen Umsetzung.',
  kwp: 10, storageKwh: 6, defaultConsumption: 6000,
};

// ---- Products catalog superset (mirrors admin Product shape), from lebe-data.js ----
export const categories: { key: Product['category']; label: string }[] = [
  { key: 'Solarmodule', label: 'Solarmodule' },
  { key: 'Wechselrichter', label: 'Wechselrichter' },
  { key: 'Heimspeicher', label: 'Heimspeicher' },
  { key: 'Ladestationen', label: 'Ladestationen' },
  { key: 'Heizsysteme', label: 'Heizsysteme' },
];

export const products: Product[] = [
  { id: 'PV-1671', category: 'Solarmodule', header: 'AIKO Neostar 3S+ 475 W', hersteller: 'Aiko', power: 475, unit: 'W', garantie: '30 Jahre Produkt & Leistung', beschreibung: 'Hocheffizientes ABC-Glas-Glas-Modul mit hervorragendem Schwachlichtverhalten.', image: A + 'products/aiko-neostar.png', logo: A + 'brands/aiko_logo.svg', status: 'Active' },
  { id: 'PV-2210', category: 'Solarmodule', header: 'Bauer BS-6MHB10 440 W', hersteller: 'Bauer', power: 440, unit: 'W', garantie: '30 Jahre', beschreibung: 'Deutsches Glas-Glas-Modul mit langlebiger Doppelglas-Konstruktion.', image: A + 'products/bauer-440.jpg', logo: A + 'brands/logo_bauer.svg', status: 'Active' },
  { id: 'PV-3040', category: 'Solarmodule', header: 'Solar Fabrik Mono S4 440 W', hersteller: 'Solar Fabrik', power: 440, unit: 'W', garantie: '25 Jahre', beschreibung: 'Robustes Full-Black-Modul, made in Germany.', image: A + 'products/solar-fabrik-440.png', logo: A + 'brands/logo_solarfabrik.png', status: 'Active' },
  { id: 'PV-3305', category: 'Solarmodule', header: 'SENEC.Solar 420 W', hersteller: 'SENEC', power: 420, unit: 'W', garantie: '25 Jahre', beschreibung: 'Passendes Modul für das SENEC-Ökosystem.', image: A + 'products/senec-solar-module.png', logo: A + 'brands/logo_senec.svg', status: 'Active' },
  { id: 'WR-8', category: 'Wechselrichter', header: 'Fronius Symo GEN24 10.0 Plus', hersteller: 'Fronius', power: 10, unit: 'kW', garantie: '10 Jahre', beschreibung: 'Hybridwechselrichter mit Notstromfunktion (PV Point).', image: A + 'products/solaredge-controller.png', logo: A + 'brands/logo_fronius.webp', status: 'Active' },
  { id: 'WR-10', category: 'Wechselrichter', header: 'Sungrow SH8.0RT', hersteller: 'Sungrow', power: 8, unit: 'kW', garantie: '10 Jahre', beschreibung: 'Dreiphasiger Hybridwechselrichter für Speichernachrüstung.', image: A + 'products/solaredge-controller.png', logo: A + 'brands/logo_sungrow.png', status: 'Active' },
  { id: 'WR-5999', category: 'Wechselrichter', header: 'SMA Sunny Tripower 50-41 CORE1', hersteller: 'SMA', power: 50, unit: 'kW', garantie: '5 Jahre', beschreibung: 'Freistehender Gewerbe-Wechselrichter für große Dachanlagen.', image: A + 'products/solaredge-controller.png', logo: A + 'brands/logo_sma.svg', status: 'Active' },
  { id: 'SP-9201', category: 'Heimspeicher', header: 'SENEC.Home P4', hersteller: 'SENEC', power: 10.65, unit: 'kWh', garantie: '10 Jahre / 10.000 Zyklen', beschreibung: 'All-in-One-Speichersystem mit integriertem Wechselrichter & App.', image: A + 'products/senec-home-e4.png', logo: A + 'brands/logo_senec.svg', status: 'Active' },
  { id: 'SP-121', category: 'Heimspeicher', header: 'Fronius Reserva 9,5', hersteller: 'Fronius', power: 9.5, unit: 'kWh', garantie: '10 Jahre', beschreibung: 'Modularer Hochvolt-Speicher, perfekt zum GEN24 passend.', image: A + 'products/fronius-reserva.png', logo: A + 'brands/logo_fronius.webp', status: 'Active' },
  { id: 'SP-7731', category: 'Heimspeicher', header: 'Sungrow SBR 096', hersteller: 'Sungrow', power: 9.6, unit: 'kWh', garantie: '10 Jahre', beschreibung: 'Stapelbarer Hochvolt-Speicher, 3,2 kWh pro Modul.', image: A + 'products/sungrow-sbr.png', logo: A + 'brands/logo_sungrow.png', status: 'Active' },
  { id: 'SP-4400', category: 'Heimspeicher', header: 'SolarEdge Home Batterie', hersteller: 'SolarEdge', power: 10, unit: 'kWh', garantie: '10 Jahre', beschreibung: 'Hochvolt-Speicher für das SolarEdge Home-Ökosystem.', image: A + 'products/se-home-batterie.png', logo: A + 'brands/logo_solaredge.svg', status: 'Active' },
  { id: 'LS-2001', category: 'Ladestationen', header: 'Sungrow EV Charger 11 kW', hersteller: 'Sungrow', power: 11, unit: 'kW', garantie: '5 Jahre', beschreibung: 'PV-optimierte Wallbox mit Überschussladen.', image: A + 'products/solaredge-controller.png', logo: A + 'brands/logo_sungrow.png', status: 'Active' },
];

export function getOfferBySlug(slug: string): Offer | undefined {
  return offers.find((o) => o.slug === slug);
}
