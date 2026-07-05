import { db } from './db.js';

// Seed data ported from the design system's ui_kits/admin/AdminData.js
// (derived from the Memodo product export). Brand/product imagery lives in
// the frontend's public/assets/ (served at /assets/...) — distinct from
// /uploads, which holds files the admin actually uploads at runtime.
const manufacturers = [
  { id: 1, name: 'Solarfabrik', description: 'Die Solarfabrik ist ein renommiertes, familiengeführtes Unternehmen aus Deutschland mit langjähriger Erfahrung im Solarmarkt. Ihre Module zeichnen sich durch deutsche Qualität, Sicherheit und Zuverlässigkeit aus.', logo: '/assets/brands/logo_solarfabrik.png', link: 'https://www.solar-fabrik.de/' },
  { id: 2, name: 'Bauer', description: 'BAUER Solar ist ein familiengeführter deutscher Solarmodulhersteller aus Rheinhessen bei Mainz. Das Unternehmen steht für Premium-Solarmodule, langjährige Markterfahrung und verlässliche Produktqualität.', logo: '/assets/brands/logo_bauer.svg', link: 'https://bauer-solar.de/' },
  { id: 3, name: 'SMA', description: 'SMA Solar Technology ist ein deutscher Spezialist für Photovoltaik-Wechselrichter und Energiemanagement. Die Lösungen decken private, gewerbliche und industrielle PV-Anwendungen ab.', logo: '/assets/brands/logo_sma.svg', link: 'https://www.sma.de/' },
  { id: 4, name: 'Fronius', description: 'Fronius ist ein internationaler Anbieter für Solartechnik, Wechselrichter und Energiemanagement. Die Produkte sind auf zuverlässige PV-Erzeugung, Monitoring und flexible Systemintegration ausgelegt.', logo: '/assets/brands/logo_fronius.webp', link: 'https://www.fronius.com/de-de/germany/solarenergie' },
  { id: 5, name: 'SolarEdge', description: 'SolarEdge bietet Wechselrichter, Leistungsoptimierer und intelligente Energiemanagement-Lösungen. Der Fokus liegt auf effizienter PV-Erzeugung, Speicherintegration und smarten Energielösungen für Gebäude.', logo: '/assets/brands/logo_solaredge.svg', link: 'https://www.solaredge.com/de/' },
  { id: 6, name: 'BYD', description: 'BYD Battery-Box steht für modulare Stromspeicherlösungen für private und gewerbliche PV-Anwendungen. Die Systeme sind skalierbar und für Hochvolt- sowie Niedervolt-Anwendungen verfügbar.', logo: '/assets/brands/logo_byd.jpg', link: 'https://www.bydbatterybox.com/' },
  { id: 7, name: 'Senec', description: 'SENEC entwickelt Stromspeicher, Solarlösungen und Ladeinfrastruktur für mehr Energieunabhängigkeit im Eigenheim. Die Produkte kombinieren PV, Speicher, App-Steuerung und E-Mobilität.', logo: '/assets/brands/logo_senec.svg', link: 'https://senec.com/de' },
  { id: 8, name: 'Aiko', description: 'AIKO entwickelt leistungsstarke Solarmodule auf Basis moderner ABC- beziehungsweise Back-Contact-Technologie. Die Module sind auf hohe Effizienz, starke Erträge und langfristige Performance ausgelegt.', logo: '/assets/brands/aiko_logo.svg', link: 'https://aikosolar.com/de/' },
  { id: 9, name: 'Sigenergy', description: 'Sigenergy bietet integrierte Lösungen für Speicher, PV-Wechselrichter, Ladeinfrastruktur und Energiemanagement. Die Systeme verbinden Solarstrom, Batterie und E-Mobilität in skalierbaren Anwendungen.', logo: null, link: 'https://www.sigenergy.com/de' },
];

const products = [
  { id: 'MOD-001', category: 'Solarmodule', Header: 'Aiko Stellar 3N+ AIKO-A670-MDE72Dw', Beschreibung: 'Aiko Stellar 3N+ AIKO-A670-MDE72Dw ist ein PV-Modul mit 670 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 24,8 % Abmessung: 2382 × 1134 × 30 mm.', Hersteller: 'Aiko', manufacturer_id: 8, Garantie: '15/30 Jahre', Power: 670, Unit: 'Watt', Spezifikation: 'spec_mod_001.pdf', hasSpec: 1, Logo: '/assets/brands/aiko_logo.svg', Status: 'Active', panelHeightMeters: 2.382, panelWidthMeters: 1.134, createdAt: '2026-06-10', updatedAt: '2026-07-01' },
  { id: 'MOD-002', category: 'Solarmodule', Header: 'Aiko Stellar 3N+ AIKO-A670-MDE72Dw', Beschreibung: 'Aiko Stellar 3N+ AIKO-A670-MDE72Dw ist ein PV-Modul mit 670 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 24,8 % Abmessung: 2382 × 1134 × 30 mm.', Hersteller: 'Aiko', manufacturer_id: 8, Garantie: '15/30 Jahre', Power: 670, Unit: 'Watt', Spezifikation: 'spec_mod_002.pdf', hasSpec: 1, Logo: '/assets/brands/aiko_logo.svg', Status: 'Draft', panelHeightMeters: 2.382, panelWidthMeters: 1.134, createdAt: '2026-06-11', updatedAt: '2026-07-02' },
  { id: 'MOD-003', category: 'Solarmodule', Header: 'Aiko Neostar 4S+ AIKO-A500-MDE54Db', Beschreibung: 'Aiko Neostar 4S+ AIKO-A500-MDE54Db ist ein PV-Modul mit 500 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Abmessung: 1762 x 1134 x 30 mm Modul-Typ: Back-Contact-Module, BiFacial, Full-Black-Module, Glas-Glas Module, Hochleistungsmodule.', Hersteller: 'Aiko', manufacturer_id: 8, Garantie: '40/40 Jahre', Power: 500, Unit: 'Watt', Spezifikation: 'spec_mod_003.pdf', hasSpec: 1, Logo: '/assets/brands/aiko_logo.svg', Status: 'Hidden', panelHeightMeters: 1.762, panelWidthMeters: 1.134, createdAt: '2026-06-12', updatedAt: '2026-07-03' },
  { id: 'MOD-004', category: 'Solarmodule', Header: 'Aiko Neostar 3P+ AIKO-A490-MCE54Dw - 25 years warranty', Beschreibung: 'Aiko Neostar 3P+ AIKO-A490-MCE54Dw - 25 years warranty ist ein PV-Modul mit 490 Watt Leistung und xBC-Technologie.', Hersteller: 'Aiko', manufacturer_id: 8, Garantie: '25 Jahre', Power: 490, Unit: 'Watt', Spezifikation: 'spec_mod_004.pdf', hasSpec: 1, Logo: '/assets/brands/aiko_logo.svg', Status: 'Active', panelHeightMeters: null, panelWidthMeters: null, createdAt: '2026-06-13', updatedAt: '2026-07-04' },
  { id: 'MOD-005', category: 'Solarmodule', Header: 'Aiko Neostar 3P+ AIKO-A490-MCE54Dw', Beschreibung: 'Aiko Neostar 3P+ AIKO-A490-MCE54Dw ist ein PV-Modul mit 490 Watt Leistung und xBC-Technologie.', Hersteller: 'Aiko', manufacturer_id: 8, Garantie: '15/30 Jahre', Power: 490, Unit: 'Watt', Spezifikation: 'spec_mod_005.pdf', hasSpec: 1, Logo: '/assets/brands/aiko_logo.svg', Status: 'Active', panelHeightMeters: null, panelWidthMeters: null, createdAt: '2026-06-14', updatedAt: '2026-07-01' },
  { id: 'MOD-006', category: 'Solarmodule', Header: 'Solar Fabrik 480W S4 BC Full Black', Beschreibung: 'Solar Fabrik 480W S4 BC Full Black ist ein PV-Modul mit 480 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 23,5 % Abmessung: 1800 x 1134 x 30 mm.', Hersteller: 'Solarfabrik', manufacturer_id: 1, Garantie: '30/30 Jahre', Power: 480, Unit: 'Watt', Spezifikation: 'spec_mod_006.pdf', hasSpec: 1, Logo: '/assets/brands/logo_solarfabrik.png', Status: 'Active', panelHeightMeters: 1.8, panelWidthMeters: 1.134, createdAt: '2026-06-15', updatedAt: '2026-07-02' },
  { id: 'INV-001', category: 'Wechselrichter', Header: 'Fronius Symo GEN24 4.0 Plus (Hybridwechselrichter)', Beschreibung: 'Fronius Symo GEN24 4.0 Plus (Hybridwechselrichter) ist ein Hybrid-Wechselrichter mit 4 kW AC-Leistung und 2 MPP-Tracker(n). Phasen: 3 Kommunikation: Ethernet, WLAN, RS485.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '10 Jahre', Power: 4, Unit: 'kW', Spezifikation: 'spec_inv_001.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Active', createdAt: '2026-06-10', updatedAt: '2026-07-01' },
  { id: 'INV-002', category: 'Wechselrichter', Header: 'Fronius Symo GEN24 10.0 Plus SC (Hybridwechselrichter)', Beschreibung: 'Fronius Symo GEN24 10.0 Plus SC (Hybridwechselrichter) ist ein Hybrid-Wechselrichter mit 10 kW AC-Leistung und 2 MPP-Tracker(n). Phasen: 3 Kommunikation: Ethernet, WLAN, RS485.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '10 Jahre', Power: 10, Unit: 'kW', Spezifikation: 'spec_inv_002.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Draft', createdAt: '2026-06-11', updatedAt: '2026-07-02' },
  { id: 'INV-003', category: 'Wechselrichter', Header: 'Fronius Symo GEN24 4.0 (PV-Wechselrichter)', Beschreibung: 'Fronius Symo GEN24 4.0 (PV-Wechselrichter) ist ein Hybrid-Wechselrichter, PV-Wechselrichter mit 4 kW AC-Leistung und 2 MPP-Tracker(n). Phasen: 3 Kommunikation: Ethernet, WLAN, RS485.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '10 Jahre', Power: 4, Unit: 'kW', Spezifikation: 'spec_inv_003.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Hidden', createdAt: '2026-06-12', updatedAt: '2026-07-03' },
  { id: 'INV-004', category: 'Wechselrichter', Header: 'Fronius Verto 30.0', Beschreibung: 'Fronius Verto 30.0 ist ein PV-Wechselrichter mit 29.99 kW AC-Leistung und 4 MPP-Tracker(n). Phasen: 3 Kommunikation: WLAN, Ethernet, RS485.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '10 Jahre', Power: 29.99, Unit: 'kW', Spezifikation: 'spec_inv_004.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Active', createdAt: '2026-06-13', updatedAt: '2026-07-04' },
  { id: 'INV-005', category: 'Wechselrichter', Header: 'SMA Sunny Tripower Hybrid X 15', Beschreibung: 'SMA Sunny Tripower Hybrid X 15 ist ein Hybrid-Wechselrichter mit 15 kW AC-Leistung und 3 MPP-Tracker(n). Phasen: 3 Kommunikation: Ethernet, WLAN.', Hersteller: 'SMA', manufacturer_id: 3, Garantie: '10 Jahre', Power: 15, Unit: 'kW', Spezifikation: 'spec_inv_005.pdf', hasSpec: 1, Logo: '/assets/brands/logo_sma.svg', Status: 'Active', createdAt: '2026-06-14', updatedAt: '2026-07-01' },
  { id: 'INV-006', category: 'Wechselrichter', Header: 'SMA Sunny Boy Smart Energy 5.0', Beschreibung: 'SMA Sunny Boy Smart Energy 5.0 ist ein Hybrid-Wechselrichter mit 5 kW AC-Leistung und 3 MPP-Tracker(n). Phasen: 1 Kommunikation: WLAN, Ethernet, BAT-CAN, RS-485.', Hersteller: 'SMA', manufacturer_id: 3, Garantie: '10 Jahre', Power: 5, Unit: 'kW', Spezifikation: 'spec_inv_006.pdf', hasSpec: 1, Logo: '/assets/brands/logo_sma.svg', Status: 'Active', createdAt: '2026-06-15', updatedAt: '2026-07-02' },
  { id: 'INV-007', category: 'Wechselrichter', Header: 'SolarEdge SE4K-RWB Kurzstring', Beschreibung: 'SolarEdge SE4K-RWB Kurzstring ist ein PV-Wechselrichter mit 4 kW AC-Leistung. Phasen: 3.', Hersteller: 'SolarEdge', manufacturer_id: 5, Garantie: '12 Jahre', Power: 4, Unit: 'kW', Spezifikation: 'spec_inv_007.pdf', hasSpec: 1, Logo: '/assets/brands/logo_solaredge.svg', Status: 'Active', createdAt: '2026-06-16', updatedAt: '2026-07-03' },
  { id: 'STO-001', category: 'Heimspeicher', Header: 'BYD Battery-Box HVB 8.9 mit 8,91kWh', Beschreibung: 'BYD Battery-Box HVB 8.9 mit 8,91kWh ist ein Heimspeicher auf Basis Hochvolt Lithium mit 8.91 kWh Nettokapazität. Speicher-Typ: Hochvolt Batterie.', Hersteller: 'BYD', manufacturer_id: 6, Garantie: '', Power: 8.91, Unit: 'kWh', Spezifikation: 'spec_sto_001.pdf', hasSpec: 1, Logo: '/assets/brands/logo_byd.jpg', Status: 'Active', createdAt: '2026-06-10', updatedAt: '2026-07-01' },
  { id: 'STO-002', category: 'Heimspeicher', Header: 'BYD Battery-Box HVB 26.7 mit 26,72kWh', Beschreibung: 'BYD Battery-Box HVB 26.7 mit 26,72kWh ist ein Heimspeicher auf Basis Hochvolt Lithium mit 26.72 kWh Nettokapazität. Speicher-Typ: Hochvolt Batterie.', Hersteller: 'BYD', manufacturer_id: 6, Garantie: '', Power: 26.72, Unit: 'kWh', Spezifikation: 'spec_sto_002.pdf', hasSpec: 1, Logo: '/assets/brands/logo_byd.jpg', Status: 'Draft', createdAt: '2026-06-11', updatedAt: '2026-07-02' },
  { id: 'STO-003', category: 'Heimspeicher', Header: 'BYD Battery-Box Premium HVM 8.3 inkl. BCU 2.0', Beschreibung: 'BYD Battery-Box Premium HVM 8.3 inkl. BCU 2.0 ist ein Heimspeicher auf Basis Hochvolt Lithium mit 8.28 kWh Nettokapazität. Speicher-Typ: Hochvolt Batterie.', Hersteller: 'BYD', manufacturer_id: 6, Garantie: '', Power: 8.28, Unit: 'kWh', Spezifikation: 'spec_sto_003.pdf', hasSpec: 1, Logo: '/assets/brands/logo_byd.jpg', Status: 'Hidden', createdAt: '2026-06-12', updatedAt: '2026-07-03' },
  { id: 'STO-004', category: 'Heimspeicher', Header: 'BYD Battery-Box Premium HVM 2,76 kWh Batteriemodul', Beschreibung: 'BYD Battery-Box Premium HVM 2,76 kWh Batteriemodul ist ein Heimspeicher auf Basis Hochvolt Lithium mit 2.76 kWh Nettokapazität. Speicher-Typ: Hochvolt Batterie.', Hersteller: 'BYD', manufacturer_id: 6, Garantie: '', Power: 2.76, Unit: 'kWh', Spezifikation: 'spec_sto_004.pdf', hasSpec: 1, Logo: '/assets/brands/logo_byd.jpg', Status: 'Active', createdAt: '2026-06-13', updatedAt: '2026-07-04' },
  { id: 'STO-005', category: 'Heimspeicher', Header: 'Fronius Reserva Pro 28.0', Beschreibung: 'Fronius Reserva Pro 28.0 ist ein Heimspeicher auf Basis Hochvolt Lithium-Eisen-Phosphat mit 27.9 kWh Nettokapazität. Speicher-Typ: 1-phasig, 3-phasig, Hochvolt Batterie, Speicher-Nachrüstung.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '10 Jahre', Power: 27.9, Unit: 'kWh', Spezifikation: 'spec_sto_005.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Active', createdAt: '2026-06-14', updatedAt: '2026-07-01' },
  { id: 'STO-006', category: 'Heimspeicher', Header: 'Sigenergy SigenStor BAT 10.0', Beschreibung: 'Sigenergy SigenStor BAT 10.0 ist ein Heimspeicher auf Basis Hochvolt Lithium-Eisen-Phosphat mit 8.76 kWh Nettokapazität. Speicher-Typ: 1-phasig, 3-phasig, Hochvolt Batterie, Speicher-Nachrüstung Zyklen: 10.000.', Hersteller: 'Sigenergy', manufacturer_id: 9, Garantie: '10 Jahre', Power: 8.76, Unit: 'kWh', Spezifikation: 'spec_sto_006.pdf', hasSpec: 1, Logo: null, Status: 'Active', createdAt: '2026-06-15', updatedAt: '2026-07-02' },
  { id: 'WAL-001', category: 'Ladestationen', Header: 'Fronius Wattpilot Flex Home 11 C6', Beschreibung: 'Fronius Wattpilot Flex Home 11 C6 ist eine Ladestation mit 11 Kilowatt Leistung und Ladeanschluss Kabel. Anzahl der Ladepunkte: 1 Zugangskontrolle: RFID.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '', Power: 11, Unit: 'Kilowatt', Spezifikation: 'spec_wal_001.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Active', createdAt: '2026-06-10', updatedAt: '2026-07-01' },
  { id: 'WAL-002', category: 'Ladestationen', Header: 'Fronius Wattpilot Flex Home 22 C6', Beschreibung: 'Fronius Wattpilot Flex Home 22 C6 ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Kabel. Anzahl der Ladepunkte: 1 Zugangskontrolle: RFID.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '', Power: 22, Unit: 'Kilowatt', Spezifikation: 'spec_wal_002.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Draft', createdAt: '2026-06-11', updatedAt: '2026-07-02' },
  { id: 'WAL-003', category: 'Ladestationen', Header: 'Fronius Wattpilot Flex Pro 11 C6E', Beschreibung: 'Fronius Wattpilot Flex Pro 11 C6E ist eine Ladestation mit 11 Kilowatt Leistung. Anzahl der Ladepunkte: 1 Zugangskontrolle: RFID.', Hersteller: 'Fronius', manufacturer_id: 4, Garantie: '', Power: 11, Unit: 'Kilowatt', Spezifikation: 'spec_wal_003.pdf', hasSpec: 1, Logo: '/assets/brands/logo_fronius.webp', Status: 'Hidden', createdAt: '2026-06-12', updatedAt: '2026-07-03' },
  { id: 'WAL-004', category: 'Ladestationen', Header: 'SMA eCharger 22 kW', Beschreibung: 'SMA eCharger 22 kW ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Buchse. Anzahl der Ladepunkte: 1 Zugangskontrolle: RFID.', Hersteller: 'SMA', manufacturer_id: 3, Garantie: '', Power: 22, Unit: 'Kilowatt', Spezifikation: 'spec_wal_004.pdf', hasSpec: 1, Logo: '/assets/brands/logo_sma.svg', Status: 'Active', createdAt: '2026-06-13', updatedAt: '2026-07-04' },
  { id: 'WAL-005', category: 'Ladestationen', Header: 'SMA EV Charger 22, Kabel 7,5 m', Beschreibung: 'SMA EV Charger 22, Kabel 7,5 m ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Kabel. Anzahl der Ladepunkte: 1 Zugangskontrolle: Nein.', Hersteller: 'SMA', manufacturer_id: 3, Garantie: '', Power: 22, Unit: 'Kilowatt', Spezifikation: 'spec_wal_005.pdf', hasSpec: 1, Logo: '/assets/brands/logo_sma.svg', Status: 'Active', createdAt: '2026-06-14', updatedAt: '2026-07-01' },
  { id: 'WAL-006', category: 'Ladestationen', Header: 'SolarEdge ONE Ladestation 22 kW Pro SE-EVN22SEM-01', Beschreibung: 'SolarEdge ONE Ladestation 22 kW Pro SE-EVN22SEM-01 ist eine Ladestation mit 22 Kilowatt Leistung. Anzahl der Ladepunkte: 1 Zugangskontrolle: RFID.', Hersteller: 'SolarEdge', manufacturer_id: 5, Garantie: '', Power: 22, Unit: 'Kilowatt', Spezifikation: 'spec_wal_006.pdf', hasSpec: 1, Logo: '/assets/brands/logo_solaredge.svg', Status: 'Active', createdAt: '2026-06-15', updatedAt: '2026-07-02' },
];

const offerComponents = [
  { id: 'service-mounting', name: 'Modulaufständerung', quantity: 1, price: 0, descriptionLines: ['Modulmontage und Verkabelung der Module bis zum Wechselrichter', 'Leitung 6qmm² inkl. MC4 Stecksystem für mehr Sicherheit'], updatedAt: '2026-06-20' },
  { id: 'service-surge-protection', name: 'Blitzschutz-AC Seitig', quantity: 1, price: 0, descriptionLines: ['Kombiableiter + Überspannungsschutz', 'Prüfklasse IEC61643-11 VDE0675-6-11: Typ1+2+3'], updatedAt: '2026-06-20' },
  { id: 'service-scaffolding', name: 'Arbeitsschutzgerüst inkl. Absturzsicherung', quantity: 1, price: 0, descriptionLines: ['Arbeits- und Schutzgerüst gemäß der Unfallverhütungsvorschriften'], updatedAt: '2026-06-21' },
  { id: 'service-delivery', name: 'Lieferung', quantity: 1, price: 0, descriptionLines: ['Lieferung der PV Anlage'], updatedAt: '2026-06-21' },
  { id: 'service-installation', name: 'Montage & Installation', quantity: 1, price: 0, descriptionLines: ['Installation & Verkabelung der Module & Verkabelung des Wechselrichters', 'Integration in den Sicherungskasten', 'Anschluss und Integration eines Energiespeichers', 'Prüfen der Spannung, Dokumentation und Abnahme durch einen unserer Elektriker', 'Diese Position ist ein Nachweis der getätigten Arbeitsleistung nach §35a EStG'], updatedAt: '2026-06-22' },
  { id: 'service-registration', name: 'Anmeldung der PV Anlage', quantity: 1, price: 0, descriptionLines: ['Zusammenstellen und Übermittlung der Anlagendaten beim zuständigen Netzbetreiber', 'Inbetriebnahme der Anlage'], updatedAt: '2026-06-22' },
];

const offers = [
  {
    id: 'OFF-005', title: 'Einfamilienhaus Premium Paket',
    subtitle: '11,4 kWp Photovoltaikanlage mit Speicher – Alles inklusive und ohne Wartezeit!',
    description: 'Mit einer leistungsstarken 11,4 kWp Photovoltaikanlage mit AIKO Solar Neostar 475 W Modulen und dem innovativen Fronius Speichersystem erzeugen Sie effizient Ihren eigenen Strom und steigern Ihren Eigenverbrauch deutlich.',
    conditions: 'Voraussetzung ist ein nach aktuell gültiger VDE-Norm entsprechender Zählerschrank und eine Internetverbindung.',
    validUntil: '2026-12-31', designedFor: 'Perfekt für Einfamilienhäuser mit freier Dachfläche und Interesse an einer hohen Einspeisevergütung',
    system: '24 Module | 9,5 kWh Energiespeicher inkl. Smart Meter',
    price: '18.500 € - Limitiertes Angebot', priceAmount: 18500, priceCurrency: 'EUR', priceLabel: '18.500 € - Limitiertes Angebot',
    link: 'www.lebe-solarenergie.de/package/5', slug: 'einfamilienhaus-premium-paket', previewImage: '/assets/offers/Einfamilienhaus.png',
    products: { solarModuleId: 'MOD-001', solarModuleCount: 24, inverterId: 'INV-001', inverterCount: 1, storageId: 'STO-001', storageCount: 1, wallboxId: null, wallboxCount: 0, heatingSystemId: null, heatingSystemCount: 0 },
    inclusive: [
      { id: 'service-mounting', name: 'Modulaufständerung', quantity: 1, price: 0, descriptionLines: ['Modulmontage und Verkabelung der Module bis zum Wechselrichter', 'Leitung 6qmm² inkl. MC4 Stecksystem für mehr Sicherheit'] },
      { id: 'service-installation', name: 'Montage & Installation', quantity: 1, price: 0, descriptionLines: ['Installation & Verkabelung der Module & Verkabelung des Wechselrichters', 'Integration in den Sicherungskasten', 'Anschluss und Integration eines Energiespeichers', 'Prüfen der Spannung, Dokumentation und Abnahme durch einen unserer Elektriker'] },
    ],
    allowChanges: 0, status: 'Active', createdAt: '2026-07-04', updatedAt: '2026-07-04',
  },
  {
    id: 'OFF-006', title: 'Sungrow Familien Paket',
    subtitle: '8,2 kWp Komplettanlage mit Sungrow Hybrid-Wechselrichter und Speicher',
    description: 'Das ausgewogene Familienpaket für den täglichen Strombedarf: hochwertige Module, ein zuverlässiger Sungrow Hybrid-Wechselrichter und ein passender Speicher für maximalen Eigenverbrauch.',
    conditions: 'Voraussetzung ist ein VDE-konformer Zählerschrank sowie ein Internetanschluss am Aufstellort.',
    validUntil: '2026-09-30', designedFor: 'Ideal für vierköpfige Familien mit mittlerem Stromverbrauch und Süd-Dach.',
    system: '18 Module | 8 kWh Energiespeicher inkl. Smart Meter',
    price: '14.900 €', priceAmount: 14900, priceCurrency: 'EUR', priceLabel: '14.900 €',
    link: 'www.lebe-solarenergie.de/package/6', slug: 'sungrow-familien-paket', previewImage: '/assets/offers/Sungrow_Familien_Paket.png',
    products: { solarModuleId: 'MOD-003', solarModuleCount: 18, inverterId: 'INV-003', inverterCount: 1, storageId: 'STO-002', storageCount: 1, wallboxId: null, wallboxCount: 0, heatingSystemId: null, heatingSystemCount: 0 },
    inclusive: [
      { id: 'service-mounting', name: 'Modulaufständerung', quantity: 1, price: 0, descriptionLines: ['Modulmontage und Verkabelung der Module bis zum Wechselrichter'] },
      { id: 'service-scaffolding', name: 'Arbeitsschutzgerüst inkl. Absturzsicherung', quantity: 1, price: 0, descriptionLines: ['Arbeits- und Schutzgerüst gemäß der Unfallverhütungsvorschriften'] },
      { id: 'service-registration', name: 'Anmeldung der PV Anlage', quantity: 1, price: 0, descriptionLines: ['Zusammenstellen und Übermittlung der Anlagendaten', 'Inbetriebnahme der Anlage'] },
    ],
    allowChanges: 1, status: 'Active', createdAt: '2026-06-18', updatedAt: '2026-06-28',
  },
  {
    id: 'OFF-007', title: 'Wallbox Erweiterung Paket',
    subtitle: 'Laden Sie Ihr E-Auto mit selbst erzeugtem Solarstrom',
    description: 'Erweitern Sie Ihre bestehende PV-Anlage um eine intelligente Wallbox und laden Sie Ihr Elektrofahrzeug bevorzugt mit überschüssigem Solarstrom.',
    conditions: 'Voraussetzung ist eine vorhandene PV-Anlage sowie ein geeigneter Anschlusspunkt in der Nähe des Stellplatzes.',
    validUntil: '2026-08-15', designedFor: 'Für Haushalte mit bestehender PV-Anlage und Elektrofahrzeug.',
    system: '1 Wallbox 11 kW | dynamisches Lastmanagement',
    price: '1.290 € - Aktion', priceAmount: 1290, priceCurrency: 'EUR', priceLabel: '1.290 € - Aktion',
    link: 'www.lebe-solarenergie.de/package/7', slug: 'wallbox-erweiterung-paket', previewImage: null,
    products: { solarModuleId: null, solarModuleCount: 0, inverterId: null, inverterCount: 0, storageId: null, storageCount: 0, wallboxId: 'WAL-001', wallboxCount: 1, heatingSystemId: null, heatingSystemCount: 0 },
    inclusive: [
      { id: 'service-installation', name: 'Montage & Installation', quantity: 1, price: 0, descriptionLines: ['Installation und Anschluss der Wallbox', 'Integration in den Sicherungskasten'] },
    ],
    allowChanges: 1, status: 'Draft', createdAt: '2026-06-25', updatedAt: '2026-07-01',
  },
  {
    id: 'OFF-008', title: 'Maximal Autark Komplettpaket',
    subtitle: '15 kWp PV, Großspeicher, Wallbox & Wärmepumpe – die Vollausstattung',
    description: 'Das Rundum-sorglos-Paket für maximale Unabhängigkeit: leistungsstarke PV-Anlage, großzügiger Speicher, Wallbox und Wärmepumpe – alles aus einer Hand geplant und installiert.',
    conditions: 'Vor-Ort-Begehung erforderlich. Voraussetzung ist ein VDE-konformer Zählerschrank und ausreichend Dachfläche.',
    validUntil: '2026-05-31', designedFor: 'Für Neubauten und sanierte Einfamilienhäuser mit hohem Energiebedarf.',
    system: '32 Module | 15 kWh Speicher | Wallbox 22 kW | Wärmepumpe',
    price: '38.900 €', priceAmount: 38900, priceCurrency: 'EUR', priceLabel: '38.900 €',
    link: 'www.lebe-solarenergie.de/package/8', slug: 'maximal-autark-komplettpaket', previewImage: null,
    products: { solarModuleId: 'MOD-002', solarModuleCount: 32, inverterId: 'INV-002', inverterCount: 1, storageId: 'STO-003', storageCount: 1, wallboxId: 'WAL-002', wallboxCount: 1, heatingSystemId: null, heatingSystemCount: 0 },
    inclusive: [
      { id: 'service-mounting', name: 'Modulaufständerung', quantity: 1, price: 0, descriptionLines: ['Modulmontage und Verkabelung'] },
      { id: 'service-surge-protection', name: 'Blitzschutz-AC Seitig', quantity: 1, price: 0, descriptionLines: ['Kombiableiter + Überspannungsschutz'] },
      { id: 'service-installation', name: 'Montage & Installation', quantity: 1, price: 0, descriptionLines: ['Komplette Installation aller Komponenten'] },
      { id: 'service-registration', name: 'Anmeldung der PV Anlage', quantity: 1, price: 0, descriptionLines: ['Anmeldung beim Netzbetreiber', 'Inbetriebnahme'] },
    ],
    allowChanges: 0, status: 'Hidden', createdAt: '2026-04-10', updatedAt: '2026-06-15',
  },
];

export function seedIfEmpty() {
  const manCount = db.prepare('SELECT COUNT(*) AS n FROM manufacturers').get().n;
  if (manCount > 0) return;

  const insertMan = db.prepare(`INSERT INTO manufacturers (id, name, description, logo, link) VALUES (@id, @name, @description, @logo, @link)`);
  const insertProduct = db.prepare(`
    INSERT INTO products (id, category, Header, Beschreibung, Hersteller, manufacturer_id, Garantie, Power, Unit, Spezifikation, hasSpec, Logo, Status, panelHeightMeters, panelWidthMeters, createdAt, updatedAt)
    VALUES (@id, @category, @Header, @Beschreibung, @Hersteller, @manufacturer_id, @Garantie, @Power, @Unit, @Spezifikation, @hasSpec, @Logo, @Status, @panelHeightMeters, @panelWidthMeters, @createdAt, @updatedAt)
  `);
  const insertComponent = db.prepare(`INSERT INTO offer_components (id, name, quantity, price, descriptionLines, updatedAt) VALUES (@id, @name, @quantity, @price, @descriptionLines, @updatedAt)`);
  const insertOffer = db.prepare(`
    INSERT INTO offers (id, title, subtitle, description, conditions, validUntil, designedFor, system, price, priceAmount, priceCurrency, priceLabel, link, slug, previewImage, products, inclusive, allowChanges, status, createdAt, updatedAt)
    VALUES (@id, @title, @subtitle, @description, @conditions, @validUntil, @designedFor, @system, @price, @priceAmount, @priceCurrency, @priceLabel, @link, @slug, @previewImage, @products, @inclusive, @allowChanges, @status, @createdAt, @updatedAt)
  `);

  const tx = db.transaction(() => {
    for (const m of manufacturers) insertMan.run({ ...m, description: m.description ?? '', logo: m.logo ?? null, link: m.link ?? '' });
    for (const p of products) insertProduct.run({ ...p, panelHeightMeters: p.panelHeightMeters ?? null, panelWidthMeters: p.panelWidthMeters ?? null });
    for (const c of offerComponents) insertComponent.run({ ...c, descriptionLines: JSON.stringify(c.descriptionLines) });
    for (const o of offers) insertOffer.run({ ...o, products: JSON.stringify(o.products), inclusive: JSON.stringify(o.inclusive) });
  });
  tx();
  console.log(`Seeded ${manufacturers.length} manufacturers, ${products.length} products, ${offerComponents.length} offer components, ${offers.length} offers.`);
}
