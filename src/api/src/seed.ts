import { ManufacturerModel } from "./models/manufacturer";
import { ProductModel } from "./models/product";
import { OfferModel } from "./models/offer";
import { SystemComponentModel } from "./models/systemComponent";
import { ServiceModel } from "./models/service";
import { RequirementTemplateModel } from "./models/requirementTemplate";
import { ProjectInsightModel } from "./models/projectInsight";
import { ContactRequestModel } from "./models/contactRequest";
import { EmployeeModel } from "./models/employee";
import { logger } from "./config/observability";

// Seed data ported from the design system's ui_kits/admin mock data (derived from the
// Memodo product export). Manufacturers are keyed here by their old sequential number
// (1-9) purely so the product/offer seed data below can reference them by that number;
// once inserted, Mongo/Cosmos assigns each manufacturer its own ObjectId, and products
// store that real id in `manufacturer_id`.
const manufacturerSeeds: Record<number, { name: string; description: string; logo: string | null; link: string }> = {
    1: { name: "Solarfabrik", description: "Die Solarfabrik ist ein renommiertes, familiengeführtes Unternehmen aus Deutschland mit langjähriger Erfahrung im Solarmarkt. Ihre Module zeichnen sich durch deutsche Qualität, Sicherheit und Zuverlässigkeit aus.", logo: "/assets/brands/logo_solarfabrik.png", link: "https://www.solar-fabrik.de/" },
    2: { name: "Bauer", description: "BAUER Solar ist ein familiengeführter deutscher Solarmodulhersteller aus Rheinhessen bei Mainz. Das Unternehmen steht für Premium-Solarmodule, langjährige Markterfahrung und verlässliche Produktqualität.", logo: "/assets/brands/logo_bauer.svg", link: "https://bauer-solar.de/" },
    3: { name: "SMA", description: "SMA Solar Technology ist ein deutscher Spezialist für Photovoltaik-Wechselrichter und Energiemanagement. Die Lösungen decken private, gewerbliche und industrielle PV-Anwendungen ab.", logo: "/assets/brands/logo_sma.svg", link: "https://www.sma.de/" },
    4: { name: "Fronius", description: "Fronius ist ein internationaler Anbieter für Solartechnik, Wechselrichter und Energiemanagement. Die Produkte sind auf zuverlässige PV-Erzeugung, Monitoring und flexible Systemintegration ausgelegt.", logo: "/assets/brands/logo_fronius.webp", link: "https://www.fronius.com/de-de/germany/solarenergie" },
    5: { name: "SolarEdge", description: "SolarEdge bietet Wechselrichter, Leistungsoptimierer und intelligente Energiemanagement-Lösungen. Der Fokus liegt auf effizienter PV-Erzeugung, Speicherintegration und smarten Energielösungen für Gebäude.", logo: "/assets/brands/logo_solaredge.svg", link: "https://www.solaredge.com/de/" },
    6: { name: "BYD", description: "BYD Battery-Box steht für modulare Stromspeicherlösungen für private und gewerbliche PV-Anwendungen. Die Systeme sind skalierbar und für Hochvolt- sowie Niedervolt-Anwendungen verfügbar.", logo: "/assets/brands/logo_byd.jpg", link: "https://www.bydbatterybox.com/" },
    7: { name: "Senec", description: "SENEC entwickelt Stromspeicher, Solarlösungen und Ladeinfrastruktur für mehr Energieunabhängigkeit im Eigenheim. Die Produkte kombinieren PV, Speicher, App-Steuerung und E-Mobilität.", logo: "/assets/brands/logo_senec.svg", link: "https://senec.com/de" },
    8: { name: "Aiko", description: "AIKO entwickelt leistungsstarke Solarmodule auf Basis moderner ABC- beziehungsweise Back-Contact-Technologie. Die Module sind auf hohe Effizienz, starke Erträge und langfristige Performance ausgelegt.", logo: "/assets/brands/aiko_logo.svg", link: "https://aikosolar.com/de/" },
    9: { name: "Sigenergy", description: "Sigenergy bietet integrierte Lösungen für Speicher, PV-Wechselrichter, Ladeinfrastruktur und Energiemanagement. Die Systeme verbinden Solarstrom, Batterie und E-Mobilität in skalierbaren Anwendungen.", logo: null, link: "https://www.sigenergy.com/de" },
};

function productSeeds(m: Record<number, string>) {
    return [
        { _id: "MOD-001", category: "Solarmodule", Header: "Aiko Stellar 3N+ AIKO-A670-MDE72Dw", Beschreibung: "Aiko Stellar 3N+ AIKO-A670-MDE72Dw ist ein PV-Modul mit 670 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 24,8 % Abmessung: 2382 × 1134 × 30 mm.", Hersteller: "Aiko", manufacturer_id: m[8], Garantie: "15/30 Jahre", Power: 670, Unit: "Watt", Spezifikation: "spec_mod_001.pdf", hasSpec: true, Logo: "/assets/brands/aiko_logo.svg", image: null, Status: "Active", panelHeightMeters: 2.382, panelWidthMeters: 1.134 },
        { _id: "MOD-002", category: "Solarmodule", Header: "Aiko Stellar 3N+ AIKO-A670-MDE72Dw", Beschreibung: "Aiko Stellar 3N+ AIKO-A670-MDE72Dw ist ein PV-Modul mit 670 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 24,8 % Abmessung: 2382 × 1134 × 30 mm.", Hersteller: "Aiko", manufacturer_id: m[8], Garantie: "15/30 Jahre", Power: 670, Unit: "Watt", Spezifikation: "spec_mod_002.pdf", hasSpec: true, Logo: "/assets/brands/aiko_logo.svg", image: null, Status: "Draft", panelHeightMeters: 2.382, panelWidthMeters: 1.134 },
        { _id: "MOD-003", category: "Solarmodule", Header: "Aiko Neostar 4S+ AIKO-A500-MDE54Db", Beschreibung: "Aiko Neostar 4S+ AIKO-A500-MDE54Db ist ein PV-Modul mit 500 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Abmessung: 1762 x 1134 x 30 mm.", Hersteller: "Aiko", manufacturer_id: m[8], Garantie: "40/40 Jahre", Power: 500, Unit: "Watt", Spezifikation: "spec_mod_003.pdf", hasSpec: true, Logo: "/assets/brands/aiko_logo.svg", image: null, Status: "Hidden", panelHeightMeters: 1.762, panelWidthMeters: 1.134 },
        { _id: "MOD-004", category: "Solarmodule", Header: "Aiko Neostar 3P+ AIKO-A490-MCE54Dw - 25 years warranty", Beschreibung: "Aiko Neostar 3P+ AIKO-A490-MCE54Dw - 25 years warranty ist ein PV-Modul mit 490 Watt Leistung und xBC-Technologie.", Hersteller: "Aiko", manufacturer_id: m[8], Garantie: "25 Jahre", Power: 490, Unit: "Watt", Spezifikation: "spec_mod_004.pdf", hasSpec: true, Logo: "/assets/brands/aiko_logo.svg", image: null, Status: "Active", panelHeightMeters: null, panelWidthMeters: null },
        { _id: "MOD-005", category: "Solarmodule", Header: "Aiko Neostar 3P+ AIKO-A490-MCE54Dw", Beschreibung: "Aiko Neostar 3P+ AIKO-A490-MCE54Dw ist ein PV-Modul mit 490 Watt Leistung und xBC-Technologie.", Hersteller: "Aiko", manufacturer_id: m[8], Garantie: "15/30 Jahre", Power: 490, Unit: "Watt", Spezifikation: "spec_mod_005.pdf", hasSpec: true, Logo: "/assets/brands/aiko_logo.svg", image: null, Status: "Active", panelHeightMeters: null, panelWidthMeters: null },
        { _id: "MOD-006", category: "Solarmodule", Header: "Solar Fabrik 480W S4 BC Full Black", Beschreibung: "Solar Fabrik 480W S4 BC Full Black ist ein PV-Modul mit 480 Watt Leistung in Glas-Glas-Bifacial-Bauweise und xBC-Technologie. Effizienz: 23,5 % Abmessung: 1800 x 1134 x 30 mm.", Hersteller: "Solarfabrik", manufacturer_id: m[1], Garantie: "30/30 Jahre", Power: 480, Unit: "Watt", Spezifikation: "spec_mod_006.pdf", hasSpec: true, Logo: "/assets/brands/logo_solarfabrik.png", image: null, Status: "Active", panelHeightMeters: 1.8, panelWidthMeters: 1.134 },
        { _id: "INV-001", category: "Wechselrichter", Header: "Fronius Symo GEN24 4.0 Plus (Hybridwechselrichter)", Beschreibung: "Fronius Symo GEN24 4.0 Plus (Hybridwechselrichter) ist ein Hybrid-Wechselrichter mit 4 kW AC-Leistung und 2 MPP-Tracker(n). Phasen: 3 Kommunikation: Ethernet, WLAN, RS485.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "10 Jahre", Power: 4, Unit: "kW", Spezifikation: "spec_inv_001.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Active" },
        { _id: "INV-002", category: "Wechselrichter", Header: "Fronius Symo GEN24 10.0 Plus SC (Hybridwechselrichter)", Beschreibung: "Fronius Symo GEN24 10.0 Plus SC (Hybridwechselrichter) ist ein Hybrid-Wechselrichter mit 10 kW AC-Leistung und 2 MPP-Tracker(n).", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "10 Jahre", Power: 10, Unit: "kW", Spezifikation: "spec_inv_002.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Draft" },
        { _id: "INV-003", category: "Wechselrichter", Header: "Fronius Symo GEN24 4.0 (PV-Wechselrichter)", Beschreibung: "Fronius Symo GEN24 4.0 (PV-Wechselrichter) ist ein Hybrid-Wechselrichter, PV-Wechselrichter mit 4 kW AC-Leistung und 2 MPP-Tracker(n).", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "10 Jahre", Power: 4, Unit: "kW", Spezifikation: "spec_inv_003.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Hidden" },
        { _id: "INV-004", category: "Wechselrichter", Header: "Fronius Verto 30.0", Beschreibung: "Fronius Verto 30.0 ist ein PV-Wechselrichter mit 29.99 kW AC-Leistung und 4 MPP-Tracker(n).", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "10 Jahre", Power: 29.99, Unit: "kW", Spezifikation: "spec_inv_004.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Active" },
        { _id: "INV-005", category: "Wechselrichter", Header: "SMA Sunny Tripower Hybrid X 15", Beschreibung: "SMA Sunny Tripower Hybrid X 15 ist ein Hybrid-Wechselrichter mit 15 kW AC-Leistung und 3 MPP-Tracker(n).", Hersteller: "SMA", manufacturer_id: m[3], Garantie: "10 Jahre", Power: 15, Unit: "kW", Spezifikation: "spec_inv_005.pdf", hasSpec: true, Logo: "/assets/brands/logo_sma.svg", image: null, Status: "Active" },
        { _id: "INV-006", category: "Wechselrichter", Header: "SMA Sunny Boy Smart Energy 5.0", Beschreibung: "SMA Sunny Boy Smart Energy 5.0 ist ein Hybrid-Wechselrichter mit 5 kW AC-Leistung und 3 MPP-Tracker(n).", Hersteller: "SMA", manufacturer_id: m[3], Garantie: "10 Jahre", Power: 5, Unit: "kW", Spezifikation: "spec_inv_006.pdf", hasSpec: true, Logo: "/assets/brands/logo_sma.svg", image: null, Status: "Active" },
        { _id: "INV-007", category: "Wechselrichter", Header: "SolarEdge SE4K-RWB Kurzstring", Beschreibung: "SolarEdge SE4K-RWB Kurzstring ist ein PV-Wechselrichter mit 4 kW AC-Leistung. Phasen: 3.", Hersteller: "SolarEdge", manufacturer_id: m[5], Garantie: "12 Jahre", Power: 4, Unit: "kW", Spezifikation: "spec_inv_007.pdf", hasSpec: true, Logo: "/assets/brands/logo_solaredge.svg", image: null, Status: "Active" },
        { _id: "STO-001", category: "Heimspeicher", Header: "BYD Battery-Box HVB 8.9 mit 8,91kWh", Beschreibung: "BYD Battery-Box HVB 8.9 mit 8,91kWh ist ein Heimspeicher auf Basis Hochvolt Lithium mit 8.91 kWh Nettokapazität.", Hersteller: "BYD", manufacturer_id: m[6], Garantie: "", Power: 8.91, Unit: "kWh", Spezifikation: "spec_sto_001.pdf", hasSpec: true, Logo: "/assets/brands/logo_byd.jpg", image: null, Status: "Active" },
        { _id: "STO-002", category: "Heimspeicher", Header: "BYD Battery-Box HVB 26.7 mit 26,72kWh", Beschreibung: "BYD Battery-Box HVB 26.7 mit 26,72kWh ist ein Heimspeicher auf Basis Hochvolt Lithium mit 26.72 kWh Nettokapazität.", Hersteller: "BYD", manufacturer_id: m[6], Garantie: "", Power: 26.72, Unit: "kWh", Spezifikation: "spec_sto_002.pdf", hasSpec: true, Logo: "/assets/brands/logo_byd.jpg", image: null, Status: "Draft" },
        { _id: "STO-003", category: "Heimspeicher", Header: "BYD Battery-Box Premium HVM 8.3 inkl. BCU 2.0", Beschreibung: "BYD Battery-Box Premium HVM 8.3 inkl. BCU 2.0 ist ein Heimspeicher auf Basis Hochvolt Lithium mit 8.28 kWh Nettokapazität.", Hersteller: "BYD", manufacturer_id: m[6], Garantie: "", Power: 8.28, Unit: "kWh", Spezifikation: "spec_sto_003.pdf", hasSpec: true, Logo: "/assets/brands/logo_byd.jpg", image: null, Status: "Hidden" },
        { _id: "STO-004", category: "Heimspeicher", Header: "BYD Battery-Box Premium HVM 2,76 kWh Batteriemodul", Beschreibung: "BYD Battery-Box Premium HVM 2,76 kWh Batteriemodul ist ein Heimspeicher auf Basis Hochvolt Lithium mit 2.76 kWh Nettokapazität.", Hersteller: "BYD", manufacturer_id: m[6], Garantie: "", Power: 2.76, Unit: "kWh", Spezifikation: "spec_sto_004.pdf", hasSpec: true, Logo: "/assets/brands/logo_byd.jpg", image: null, Status: "Active" },
        { _id: "STO-005", category: "Heimspeicher", Header: "Fronius Reserva Pro 28.0", Beschreibung: "Fronius Reserva Pro 28.0 ist ein Heimspeicher auf Basis Hochvolt Lithium-Eisen-Phosphat mit 27.9 kWh Nettokapazität.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "10 Jahre", Power: 27.9, Unit: "kWh", Spezifikation: "spec_sto_005.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Active" },
        { _id: "STO-006", category: "Heimspeicher", Header: "Sigenergy SigenStor BAT 10.0", Beschreibung: "Sigenergy SigenStor BAT 10.0 ist ein Heimspeicher auf Basis Hochvolt Lithium-Eisen-Phosphat mit 8.76 kWh Nettokapazität.", Hersteller: "Sigenergy", manufacturer_id: m[9], Garantie: "10 Jahre", Power: 8.76, Unit: "kWh", Spezifikation: "spec_sto_006.pdf", hasSpec: true, Logo: null, image: null, Status: "Active" },
        { _id: "WAL-001", category: "Ladestationen", Header: "Fronius Wattpilot Flex Home 11 C6", Beschreibung: "Fronius Wattpilot Flex Home 11 C6 ist eine Ladestation mit 11 Kilowatt Leistung und Ladeanschluss Kabel.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "", Power: 11, Unit: "Kilowatt", Spezifikation: "spec_wal_001.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Active" },
        { _id: "WAL-002", category: "Ladestationen", Header: "Fronius Wattpilot Flex Home 22 C6", Beschreibung: "Fronius Wattpilot Flex Home 22 C6 ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Kabel.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "", Power: 22, Unit: "Kilowatt", Spezifikation: "spec_wal_002.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Draft" },
        { _id: "WAL-003", category: "Ladestationen", Header: "Fronius Wattpilot Flex Pro 11 C6E", Beschreibung: "Fronius Wattpilot Flex Pro 11 C6E ist eine Ladestation mit 11 Kilowatt Leistung.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "", Power: 11, Unit: "Kilowatt", Spezifikation: "spec_wal_003.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Hidden" },
        { _id: "WAL-004", category: "Ladestationen", Header: "SMA eCharger 22 kW", Beschreibung: "SMA eCharger 22 kW ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Buchse.", Hersteller: "SMA", manufacturer_id: m[3], Garantie: "", Power: 22, Unit: "Kilowatt", Spezifikation: "spec_wal_004.pdf", hasSpec: true, Logo: "/assets/brands/logo_sma.svg", image: null, Status: "Active" },
        { _id: "WAL-005", category: "Ladestationen", Header: "SMA EV Charger 22, Kabel 7,5 m", Beschreibung: "SMA EV Charger 22, Kabel 7,5 m ist eine Ladestation mit 22 Kilowatt Leistung und Ladeanschluss Kabel.", Hersteller: "SMA", manufacturer_id: m[3], Garantie: "", Power: 22, Unit: "Kilowatt", Spezifikation: "spec_wal_005.pdf", hasSpec: true, Logo: "/assets/brands/logo_sma.svg", image: null, Status: "Active" },
        { _id: "WAL-006", category: "Ladestationen", Header: "SolarEdge ONE Ladestation 22 kW Pro SE-EVN22SEM-01", Beschreibung: "SolarEdge ONE Ladestation 22 kW Pro SE-EVN22SEM-01 ist eine Ladestation mit 22 Kilowatt Leistung.", Hersteller: "SolarEdge", manufacturer_id: m[5], Garantie: "", Power: 22, Unit: "Kilowatt", Spezifikation: "spec_wal_006.pdf", hasSpec: true, Logo: "/assets/brands/logo_solaredge.svg", image: null, Status: "Active" },
        { _id: "HEAT-001", category: "Heizsysteme", Header: "Fronius Ohmpilot 6", Beschreibung: "Fronius Ohmpilot 6 ist ein Energiemanagement-Gerät, das überschüssigen PV-Strom in Wärme (z. B. Warmwasser) umwandelt.", Hersteller: "Fronius", manufacturer_id: m[4], Garantie: "5 Jahre", Power: 6, Unit: "kW", Spezifikation: "spec_heat_001.pdf", hasSpec: true, Logo: "/assets/brands/logo_fronius.webp", image: null, Status: "Active" },
    ];
}

const systemComponentSeeds = [
    { _id: "sc-smart-meter", name: "Smart Meter", category: "Messtechnik", unit: "Stück", internalPrice: 320, publicLabel: "Smart Meter", publicDescription: "Intelligenter Stromzähler zur präzisen Erfassung von Erzeugung und Verbrauch.", visibility: "public", included: true, optional: false },
    { _id: "sc-notstromschalter", name: "Notstromschalter", category: "Backup", unit: "Stück", internalPrice: 480, publicLabel: "Notstromschalter", publicDescription: "Ermöglicht die manuelle Umschaltung auf Notstrombetrieb bei Netzausfall.", visibility: "public", included: false, optional: true },
    { _id: "sc-backup-box", name: "Backup Box", category: "Backup", unit: "Stück", internalPrice: 890, publicLabel: "Backup Box", publicDescription: "Automatische Ersatzstromversorgung für ausgewählte Stromkreise bei Netzausfall.", visibility: "public", included: false, optional: true },
    { _id: "sc-energiemanager", name: "Energiemanager", category: "Energiemanagement", unit: "Stück", internalPrice: 260, publicLabel: "Energiemanager", publicDescription: "Steuert Energieflüsse zwischen PV-Anlage, Speicher, Verbrauchern und Netz.", visibility: "public", included: true, optional: false },
    { _id: "sc-ueberspannung-ac", name: "Überspannungsschutz AC", category: "Schutztechnik", unit: "Stück", internalPrice: 140, publicLabel: "Überspannungsschutz (AC)", publicDescription: "Schützt die Wechselstromseite der Anlage vor Überspannungsschäden.", visibility: "public", included: true, optional: false },
    { _id: "sc-ueberspannung-dc", name: "Überspannungsschutz DC", category: "Schutztechnik", unit: "Stück", internalPrice: 150, publicLabel: "Überspannungsschutz (DC)", publicDescription: "Schützt die Gleichstromseite der Anlage vor Überspannungsschäden.", visibility: "public", included: true, optional: false },
    { _id: "sc-unterkonstruktion", name: "Unterkonstruktion", category: "Montagematerial", unit: "Pauschal", internalPrice: 620, publicLabel: "Unterkonstruktion", publicDescription: "Trägersystem zur sicheren Befestigung der Module auf dem Dach.", visibility: "internal", included: true, optional: false },
    { _id: "sc-montageschienen", name: "Montageschienen", category: "Montagematerial", unit: "Pauschal", internalPrice: 340, publicLabel: "Montageschienen", publicDescription: "Schienensystem für die Modulmontage.", visibility: "internal", included: true, optional: false },
    { _id: "sc-dachhaken", name: "Dachhaken", category: "Montagematerial", unit: "Pauschal", internalPrice: 180, publicLabel: "Dachhaken", publicDescription: "Verankerung der Unterkonstruktion in der Dachsubstanz.", visibility: "hidden", included: true, optional: false },
    { _id: "sc-solarkabel", name: "Solarkabel", category: "Verkabelung", unit: "Pauschal", internalPrice: 210, publicLabel: "Solarkabel", publicDescription: "UV- und witterungsbeständige Verkabelung der PV-Anlage.", visibility: "hidden", included: true, optional: false },
    { _id: "sc-mc4-stecker", name: "MC4-Stecker", category: "Verkabelung", unit: "Pauschal", internalPrice: 60, publicLabel: "MC4-Stecksystem", publicDescription: "Sichere Steckverbindungen für die DC-Verkabelung.", visibility: "hidden", included: true, optional: false },
    { _id: "sc-sicherungsmaterial", name: "Sicherungsmaterial", category: "Elektrik", unit: "Pauschal", internalPrice: 95, publicLabel: "Sicherungsmaterial", publicDescription: "Absicherung der Anlage gemäß aktueller Norm.", visibility: "hidden", included: true, optional: false },
    { _id: "sc-zaehlerschrankmaterial", name: "Zählerschrankmaterial", category: "Elektrik", unit: "Pauschal", internalPrice: 220, publicLabel: "Zählerschrankmaterial", publicDescription: "Erforderliches Material zur Integration in den Zählerschrank.", visibility: "hidden", included: true, optional: false },
    { _id: "sc-kommunikationsmodul", name: "Kommunikationsmodul", category: "Monitoring", unit: "Stück", internalPrice: 130, publicLabel: "Kommunikationsmodul", publicDescription: "Verbindet die Anlage mit dem Monitoring-Portal.", visibility: "public", included: true, optional: false },
    { _id: "sc-datenlogger", name: "Datenlogger", category: "Monitoring", unit: "Stück", internalPrice: 175, publicLabel: "Datenlogger", publicDescription: "Zeichnet Ertrags- und Verbrauchsdaten für das Monitoring auf.", visibility: "internal", included: false, optional: true },
];

const serviceSeeds = [
    { _id: "srv-beratung", name: "Persönliche Beratung", category: "Planung", descriptionLines: ["Individuelle Vor-Ort- oder Videoberatung zu Ihrem PV-Projekt"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-anlagenplanung", name: "Anlagenplanung", category: "Planung", descriptionLines: ["Technische Auslegung von Modulen, Wechselrichter und Speicher"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-ertragsauslegung", name: "Ertragsauslegung", category: "Planung", descriptionLines: ["Berechnung des voraussichtlichen Jahresertrags anhand Standort und Ausrichtung"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-lieferung", name: "Lieferung", category: "Logistik", descriptionLines: ["Lieferung aller Komponenten der PV-Anlage"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-geruest", name: "Arbeitsschutzgerüst", category: "Montage", descriptionLines: ["Auf- und Abbau eines normgerechten Arbeits- und Schutzgerüsts inkl. Absturzsicherung"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-modulmontage", name: "Modulmontage", category: "Montage", descriptionLines: ["Montage der Module auf der Unterkonstruktion"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-dc-verkabelung", name: "DC-Verkabelung", category: "Elektroinstallation", descriptionLines: ["Verkabelung der Module bis zum Wechselrichter inkl. MC4-Stecksystem"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-ac-elektro", name: "AC-Elektroinstallation", category: "Elektroinstallation", descriptionLines: ["Integration des Wechselrichters in den Sicherungskasten"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-wr-installation", name: "Wechselrichterinstallation", category: "Elektroinstallation", descriptionLines: ["Montage und Anschluss des Wechselrichters"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-speicherintegration", name: "Speicherintegration", category: "Elektroinstallation", descriptionLines: ["Anschluss und Integration des Energiespeichers in das System"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-wallboxinstallation", name: "Wallboxinstallation", category: "Elektroinstallation", descriptionLines: ["Installation und Anschluss der Wallbox inkl. Lastmanagement"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-smartmeter-integration", name: "Smart-Meter-Integration", category: "Elektroinstallation", descriptionLines: ["Einbindung des Smart Meters in das Energiemanagement"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-anmeldung", name: "Anmeldung beim Netzbetreiber", category: "Verwaltung", descriptionLines: ["Zusammenstellung und Übermittlung der Anlagendaten beim zuständigen Netzbetreiber"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-inbetriebnahme", name: "Inbetriebnahme", category: "Verwaltung", descriptionLines: ["Prüfung der Anlage, Dokumentation und Abnahme durch einen unserer Elektriker"], taxRelevantForCraftsmanWork: true, visibility: "public", included: true },
    { _id: "srv-dokumentation", name: "Dokumentation", category: "Verwaltung", descriptionLines: ["Vollständige technische Dokumentation Ihrer Anlage"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-einweisung", name: "Einweisung", category: "Service", descriptionLines: ["Persönliche Einweisung in Bedienung und Monitoring Ihrer Anlage"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
    { _id: "srv-monitoring", name: "Monitoring-Einrichtung", category: "Service", descriptionLines: ["Einrichtung des Online-Monitorings inkl. App-Zugang"], taxRelevantForCraftsmanWork: false, visibility: "public", included: true },
];

const requirementTemplateSeeds = [
    { _id: "req-dachflaeche", title: "Geeignete Dachfläche", description: "Ausreichend nutzbare, unverschattete Dachfläche für die geplante Modulanzahl.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-zaehlerschrank-norm", title: "Zählerschrank nach aktueller Norm", description: "Der Zählerschrank muss den aktuell gültigen VDE-Normen entsprechen.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-internet", title: "Internetverbindung", description: "Für Monitoring und Fernwartung wird eine Internetverbindung am Aufstellort benötigt.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-zugang-zaehlerschrank", title: "Zugang zum Zählerschrank", description: "Freier Zugang zum Zählerschrank während der Installation.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-zugang-dach", title: "Zugang zur Dachfläche", description: "Ausreichender Zugang zur Dachfläche für Montage und Gerüst.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-technische-pruefung", title: "Technische Prüfung vor Umsetzung", description: "Vor Umsetzung erfolgt eine technische Prüfung der Voraussetzungen vor Ort.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "req-netzanschluss", title: "Geeigneter Netzanschluss", description: "Der vorhandene Netzanschluss muss für die geplante Anlagengröße ausgelegt sein.", type: "requirement", visibility: "public", priceType: "included", optionalPrice: null },
    { _id: "opt-zaehlerschrank-erneuerung", title: "Zählerschrank-Erneuerung", description: "Falls der Zählerschrank nicht der aktuellen Norm entspricht, kann eine Erneuerung notwendig werden.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-dachsanierung", title: "Dachsanierung", description: "Bei technischem Prüfbedarf am Dach kann eine Sanierung vor Montage erforderlich sein.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-sondergeruest", title: "Sondergerüst", description: "Bei schwer zugänglichen Dächern kann ein Sondergerüst notwendig werden.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-kabelwege", title: "Sehr lange Kabelwege", description: "Bei ungewöhnlich langen Kabelwegen können zusätzliche Materialkosten entstehen.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-kernbohrungen", title: "Zusätzliche Kernbohrungen", description: "Für die Kabelführung können zusätzliche Kernbohrungen notwendig werden.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-erdarbeiten", title: "Erdarbeiten", description: "Bei Freiflächenanlagen oder Erdkabelverlegung können Erdarbeiten anfallen.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-netzanschlussverstaerkung", title: "Netzanschlussverstärkung", description: "Bei unzureichendem Netzanschluss kann eine Verstärkung durch den Netzbetreiber nötig werden.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-statische-pruefung", title: "Statische Prüfung", description: "Bei Zweifeln an der Dachstatik kann eine gesonderte statische Prüfung erforderlich sein.", type: "optionalAdditionalWork", visibility: "public", priceType: "startingFrom", optionalPrice: 350 },
    { _id: "opt-brandschutz", title: "Brandschutzkonzept", description: "Für gewerbliche Anlagen kann ein individuelles Brandschutzkonzept erforderlich sein.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
    { _id: "opt-sonderwuensche", title: "Sonderwünsche außerhalb des Pakets", description: "Individuelle Zusatzwünsche, die über den Paketumfang hinausgehen.", type: "optionalAdditionalWork", visibility: "public", priceType: "onRequest", optionalPrice: null },
];

const employeeSeeds = [
    { _id: "emp-001", name: "Jonathan Leu", email: "jonathan.leu@lebe-solarenergie.de", role: "Geschäftsführung", active: true },
    { _id: "emp-002", name: "Sabine Krause", email: "sabine.krause@lebe-solarenergie.de", role: "Kundenberatung", active: true },
    { _id: "emp-003", name: "Marco Weller", email: "marco.weller@lebe-solarenergie.de", role: "Elektromeister", active: true },
    { _id: "emp-004", name: "Nina Brandt", email: "nina.brandt@lebe-solarenergie.de", role: "Projektplanung", active: true },
    { _id: "emp-005", name: "Tobias Reuter", email: "tobias.reuter@lebe-solarenergie.de", role: "Bauleitung", active: false },
];

function includedFrom(ids: string[], overrides: Record<string, Partial<{ quantity: number }>> = {}) {
    return ids.map(id => {
        const t = serviceSeeds.find(s => s._id === id)!;
        return { id: t._id, name: t.name, quantity: overrides[id]?.quantity || 1, internalPrice: 0, publicDescription: "", descriptionLines: t.descriptionLines, category: t.category, visibility: t.visibility, included: t.included, taxRelevantForCraftsmanWork: t.taxRelevantForCraftsmanWork };
    });
}
function componentsFrom(ids: string[]) {
    return ids.map(id => {
        const t = systemComponentSeeds.find(s => s._id === id)!;
        return { id: t._id, name: t.name, category: t.category, quantity: 1, unit: t.unit, internalPrice: t.internalPrice, publicLabel: t.publicLabel, publicDescription: t.publicDescription, visibility: t.visibility, included: t.included, optional: t.optional };
    });
}
function requirementsFrom(ids: string[]) {
    return ids.map(id => {
        const t = requirementTemplateSeeds.find(s => s._id === id)!;
        return { id: t._id, title: t.title, description: t.description, type: t.type, visibility: t.visibility, priceType: t.priceType, optionalPrice: t.optionalPrice };
    });
}

const DISCLAIMER = "Diese Berechnung ist eine unverbindliche Beispielrechnung. Die tatsächliche Wirtschaftlichkeit hängt unter anderem von Dachausrichtung, Verschattung, Verbrauchsprofil, Strompreis, Inbetriebnahmezeitpunkt und technischer Auslegung ab.";

function offerSeeds() {
    return [
        {
            _id: "OFF-005", title: "Einfamilienhaus Premium Paket",
            subtitle: "11,4 kWp Photovoltaikanlage mit Speicher – Alles inklusive und ohne Wartezeit!",
            status: "Active",
            targetCustomer: "Einfamilienhäuser mit freier Dachfläche",
            designedFor: "Perfekt für Einfamilienhäuser mit freier Dachfläche und Interesse an einer hohen Einspeisevergütung",
            shortDescription: "24 Module, Fronius Speicher und Smart Meter – alles aus einer Hand.",
            longDescription: "Mit einer leistungsstarken 11,4 kWp Photovoltaikanlage mit AIKO Solar Neostar 475 W Modulen und dem innovativen Fronius Speichersystem erzeugen Sie effizient Ihren eigenen Strom und steigern Ihren Eigenverbrauch deutlich.",
            priceType: "fixed", priceAmount: 18500, priceCurrency: "EUR", priceLabel: "18.500 € - Limitiertes Angebot",
            taxNote: "Preis inkl. 0 % Umsatzsteuer, sofern die gesetzlichen Voraussetzungen erfüllt sind.",
            validUntil: "2026-12-31",
            slug: "einfamilienhaus-premium-paket", publicUrl: "lebe-solarenergie.de/angebot/einfamilienhaus-premium-paket", previewImageUrl: "/assets/offers/Einfamilienhaus.png",
            mainProducts: { solarModule: { productId: "MOD-001", quantity: 24 }, inverter: { productId: "INV-001", quantity: 1 }, storage: { productId: "STO-001", quantity: 1 } },
            systemComponents: componentsFrom(["sc-smart-meter", "sc-energiemanager", "sc-ueberspannung-ac", "sc-ueberspannung-dc", "sc-unterkonstruktion", "sc-montageschienen", "sc-dachhaken", "sc-solarkabel", "sc-mc4-stecker", "sc-kommunikationsmodul"]),
            includedServices: includedFrom(["srv-beratung", "srv-anlagenplanung", "srv-lieferung", "srv-geruest", "srv-modulmontage", "srv-dc-verkabelung", "srv-ac-elektro", "srv-speicherintegration", "srv-anmeldung", "srv-inbetriebnahme", "srv-einweisung"]),
            requirementsAndExclusions: requirementsFrom(["req-dachflaeche", "req-zaehlerschrank-norm", "req-internet", "req-technische-pruefung", "opt-zaehlerschrank-erneuerung", "opt-dachsanierung", "opt-sondergeruest"]),
            economics: { enabled: true, annualConsumptionKwh: 4500, electricityPriceCentPerKwh: 35, specificYieldKwhPerKwp: 950, selfConsumptionRate: 0.35, autarkyRate: 0.55, feedInTariffCentPerKwh: 7.9, observationYears: 20, electricityPriceIncreasePercent: 3, disclaimer: DISCLAIMER },
            allowChanges: false,
        },
        {
            _id: "OFF-006", title: "Sungrow Familien Paket",
            subtitle: "8,2 kWp Komplettanlage mit Sungrow Hybrid-Wechselrichter und Speicher",
            status: "Active",
            targetCustomer: "Familien mit mittlerem Stromverbrauch",
            designedFor: "Ideal für vierköpfige Familien mit mittlerem Stromverbrauch und Süd-Dach.",
            shortDescription: "18 Module, 8 kWh Speicher inkl. Smart Meter – das ausgewogene Familienpaket.",
            longDescription: "Das ausgewogene Familienpaket für den täglichen Strombedarf: hochwertige Module, ein zuverlässiger Wechselrichter und ein passender Speicher für maximalen Eigenverbrauch.",
            priceType: "fixed", priceAmount: 14900, priceCurrency: "EUR", priceLabel: "14.900 €",
            taxNote: "Preis inkl. 0 % Umsatzsteuer, sofern die gesetzlichen Voraussetzungen erfüllt sind.",
            validUntil: "2026-09-30",
            slug: "sungrow-familien-paket", publicUrl: "lebe-solarenergie.de/angebot/sungrow-familien-paket", previewImageUrl: "/assets/offers/Sungrow_Familien_Paket.png",
            mainProducts: { solarModule: { productId: "MOD-003", quantity: 18 }, inverter: { productId: "INV-003", quantity: 1 }, storage: { productId: "STO-002", quantity: 1 } },
            systemComponents: componentsFrom(["sc-smart-meter", "sc-ueberspannung-ac", "sc-ueberspannung-dc", "sc-unterkonstruktion", "sc-montageschienen", "sc-solarkabel", "sc-mc4-stecker"]),
            includedServices: includedFrom(["srv-beratung", "srv-lieferung", "srv-modulmontage", "srv-dc-verkabelung", "srv-ac-elektro", "srv-speicherintegration", "srv-anmeldung", "srv-inbetriebnahme"]),
            requirementsAndExclusions: requirementsFrom(["req-dachflaeche", "req-zaehlerschrank-norm", "req-internet", "opt-zaehlerschrank-erneuerung", "opt-sondergeruest"]),
            economics: { enabled: true, annualConsumptionKwh: 4200, electricityPriceCentPerKwh: 34, specificYieldKwhPerKwp: 920, selfConsumptionRate: 0.4, autarkyRate: 0.6, feedInTariffCentPerKwh: 7.9, observationYears: 20, electricityPriceIncreasePercent: 3, disclaimer: DISCLAIMER },
            allowChanges: true,
        },
        {
            _id: "OFF-007", title: "Wallbox Erweiterung Paket",
            subtitle: "Laden Sie Ihr E-Auto mit selbst erzeugtem Solarstrom",
            status: "Draft",
            targetCustomer: "Haushalte mit bestehender PV-Anlage",
            designedFor: "Für Haushalte mit bestehender PV-Anlage und Elektrofahrzeug.",
            shortDescription: "1 Wallbox 11 kW mit dynamischem Lastmanagement.",
            longDescription: "Erweitern Sie Ihre bestehende PV-Anlage um eine intelligente Wallbox und laden Sie Ihr Elektrofahrzeug bevorzugt mit überschüssigem Solarstrom.",
            priceType: "fixed", priceAmount: 1290, priceCurrency: "EUR", priceLabel: "1.290 € - Aktion",
            taxNote: "",
            validUntil: "2026-08-15",
            slug: "wallbox-erweiterung-paket", publicUrl: "lebe-solarenergie.de/angebot/wallbox-erweiterung-paket", previewImageUrl: null,
            mainProducts: { wallbox: { productId: "WAL-001", quantity: 1 } },
            systemComponents: componentsFrom(["sc-sicherungsmaterial"]),
            includedServices: includedFrom(["srv-wallboxinstallation", "srv-anmeldung"]),
            requirementsAndExclusions: requirementsFrom(["req-netzanschluss", "req-zugang-zaehlerschrank", "opt-kabelwege", "opt-kernbohrungen"]),
            economics: { enabled: false, disclaimer: DISCLAIMER },
            allowChanges: true,
        },
        {
            _id: "OFF-008", title: "Maximal Autark Komplettpaket",
            subtitle: "15 kWp PV, Großspeicher, Wallbox & Wärmepumpen-Anbindung – die Vollausstattung",
            status: "Hidden",
            targetCustomer: "Neubauten und sanierte Einfamilienhäuser",
            designedFor: "Für Neubauten und sanierte Einfamilienhäuser mit hohem Energiebedarf.",
            shortDescription: "32 Module, 15 kWh Speicher, Wallbox 22 kW und Energiemanagement inklusive.",
            longDescription: "Das Rundum-sorglos-Paket für maximale Unabhängigkeit: leistungsstarke PV-Anlage, großzügiger Speicher, Wallbox und Energiemanagement – alles aus einer Hand geplant und installiert.",
            priceType: "starting_from", priceAmount: 38900, priceCurrency: "EUR", priceLabel: "ab 38.900 €",
            taxNote: "Final nach Dach- und technischer Prüfung.",
            validUntil: "2026-05-31",
            slug: "maximal-autark-komplettpaket", publicUrl: "lebe-solarenergie.de/angebot/maximal-autark-komplettpaket", previewImageUrl: null,
            mainProducts: { solarModule: { productId: "MOD-002", quantity: 32 }, inverter: { productId: "INV-002", quantity: 1 }, storage: { productId: "STO-003", quantity: 1 }, wallbox: { productId: "WAL-002", quantity: 1 } },
            systemComponents: componentsFrom(["sc-smart-meter", "sc-energiemanager", "sc-notstromschalter", "sc-backup-box", "sc-ueberspannung-ac", "sc-ueberspannung-dc", "sc-unterkonstruktion", "sc-montageschienen", "sc-dachhaken", "sc-solarkabel", "sc-mc4-stecker", "sc-kommunikationsmodul", "sc-datenlogger"]),
            includedServices: includedFrom(["srv-beratung", "srv-anlagenplanung", "srv-ertragsauslegung", "srv-lieferung", "srv-geruest", "srv-modulmontage", "srv-dc-verkabelung", "srv-ac-elektro", "srv-wr-installation", "srv-speicherintegration", "srv-wallboxinstallation", "srv-smartmeter-integration", "srv-anmeldung", "srv-inbetriebnahme", "srv-dokumentation", "srv-einweisung", "srv-monitoring"]),
            requirementsAndExclusions: requirementsFrom(["req-dachflaeche", "req-zaehlerschrank-norm", "req-internet", "req-technische-pruefung", "req-netzanschluss", "opt-dachsanierung", "opt-sondergeruest", "opt-netzanschlussverstaerkung", "opt-statische-pruefung", "opt-brandschutz"]),
            economics: { enabled: true, annualConsumptionKwh: 6500, electricityPriceCentPerKwh: 36, specificYieldKwhPerKwp: 970, selfConsumptionRate: 0.45, autarkyRate: 0.7, feedInTariffCentPerKwh: 7.9, observationYears: 20, electricityPriceIncreasePercent: 3, disclaimer: DISCLAIMER },
            allowChanges: false,
        },
    ];
}

const projectInsightSeeds = [
    {
        _id: "PRJ-001", status: "Veröffentlicht",
        title: "Einfamilienhaus mit Speicher & Wallbox", locationLabel: "Rödermark", buildingType: "Einfamilienhaus", customerType: "Privatkunde",
        projectYear: 2025, projectStatus: "umgesetzt",
        mainImage: "/assets/offers/Einfamilienhaus.png", imageAlt: "Photovoltaikanlage auf einem Einfamilienhaus in Rödermark", galleryImages: [],
        badges: [
            { id: "b1", label: "11,4 kWp", type: "Leistung", visible: true, sortOrder: 0 },
            { id: "b2", label: "24 Module", type: "Modulanzahl", visible: true, sortOrder: 1 },
            { id: "b3", label: "Fronius", type: "Hersteller", visible: true, sortOrder: 2 },
            { id: "b4", label: "Speicher", type: "Speicher", visible: true, sortOrder: 3 },
            { id: "b5", label: "Hausautomation", type: "Besonderheit", visible: true, sortOrder: 4 },
        ],
        shortDescription: "24 Module, Fronius Reserva Speicher und Sungrow Wallbox – vollständig integriert in die Hausautomation.",
        internalNote: "",
        visibility: { landingPage: true, aboutPage: true, projectOverview: true, offerDetails: false, internalOnly: false },
        featured: true, sortOrder: 1, publishedFrom: null, publishedUntil: null,
    },
    {
        _id: "PRJ-002", status: "Veröffentlicht",
        title: "Reihenmittelhaus, modular geplant", locationLabel: "Dietzenbach", buildingType: "Reihenhaus", customerType: "Privatkunde",
        projectYear: 2025, projectStatus: "umgesetzt",
        mainImage: "/assets/offers/Sungrow_Familien_Paket.png", imageAlt: "Photovoltaikanlage auf einem Reihenmittelhaus in Dietzenbach", galleryImages: [],
        badges: [
            { id: "b1", label: "7,6 kWp", type: "Leistung", visible: true, sortOrder: 0 },
            { id: "b2", label: "Nachrüstbar", type: "Besonderheit", visible: true, sortOrder: 1 },
        ],
        shortDescription: "Kompakte Anlage mit vorbereiteter Nachrüstung für Speicher und Wallbox.",
        internalNote: "",
        visibility: { landingPage: true, aboutPage: true, projectOverview: true, offerDetails: false, internalOnly: false },
        featured: false, sortOrder: 2, publishedFrom: null, publishedUntil: null,
    },
    {
        _id: "PRJ-003", status: "Veröffentlicht",
        title: "Gewerbedach für Produktionsbetrieb", locationLabel: "Rhein-Main-Gebiet", buildingType: "Gewerbedach", customerType: "Gewerbekunde",
        projectYear: 2024, projectStatus: "umgesetzt",
        mainImage: null, imageAlt: "Photovoltaikanlage auf einem Gewerbedach im Rhein-Main-Gebiet", galleryImages: [],
        badges: [
            { id: "b1", label: "52,25 kWp", type: "Leistung", visible: true, sortOrder: 0 },
            { id: "b2", label: "110 Module", type: "Modulanzahl", visible: true, sortOrder: 1 },
            { id: "b3", label: "Gewerbe", type: "Gebäudetyp", visible: true, sortOrder: 2 },
            { id: "b4", label: "Eigenverbrauch", type: "Besonderheit", visible: true, sortOrder: 3 },
        ],
        shortDescription: "110 Module auf einer Gewerbehalle, ausgelegt auf hohen Eigenverbrauch im Tagbetrieb.",
        internalNote: "",
        visibility: { landingPage: false, aboutPage: true, projectOverview: true, offerDetails: false, internalOnly: false },
        featured: false, sortOrder: 3, publishedFrom: null, publishedUntil: null,
    },
];

function contactRequestSeeds() {
    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
    const log = (action: string, actorName = "System", when = now.toISOString()) => ({ id: `log-${action}-${when}`, action, actorName, createdAt: when });

    return [
        {
            _id: "REQ-0001", schemaVersion: "contactRequest.v1", status: "Neu",
            inquiryType: "Paketprüfung", inquiryTypeKey: "offerPackage", requestMode: "offerPackage",
            kunde: { name: "Max Mustermann", email: "max.mustermann@example.com", phone: "+49 170 1234567", postalCode: "63322", city: "Rödermark", street: "Musterstraße 12", preferredContactTime: "Nachmittags" },
            additionalCustomerInputs: { annualConsumptionKwh: 4500, desiredCallbackTime: "Nachmittags", roofPhotoProvided: true, meterCabinetPhotoProvided: true },
            message: "Wir interessieren uns für das Einfamilienhaus Premium Paket und würden gerne einen Vor-Ort-Termin vereinbaren.",
            anfrageweg: { source: "Angebotsdetailseite", sourceUrl: "/angebote/einfamilienhaus-premium-paket", entryPointLabel: "Angebotsdetail", ctaLabel: "Paket unverbindlich prüfen lassen", submittedAt: daysAgo(0) },
            anfrageSnapshot: { requestMode: "offerPackage", offerSnapshot: { id: "OFF-005", title: "Einfamilienhaus Premium Paket", subtitle: "11,4 kWp Photovoltaikanlage mit Speicher", priceLabel: "18.500 € - Limitiertes Angebot", originalUrl: "/angebote/einfamilienhaus-premium-paket" }, computedSystemSnapshot: { pvPowerKwp: 11.4, moduleCount: 24, storageCapacityKwh: 8.91, calculatedAt: daysAgo(0) } },
            wirtschaftlichkeitsrechnung: null,
            attachments: [{ id: "att-1", type: "roofPhoto", fileName: "dach.jpg", fileUrl: "/assets/images/placeholder-roof.jpg", mimeType: "image/jpeg", uploadedAt: daysAgo(0) }],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(0), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(0), submittedAt: daysAgo(0), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: { assignedTo: null, todo: null, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(0))] },
        },
        {
            _id: "REQ-0002", schemaVersion: "contactRequest.v1", status: "Gelesen",
            inquiryType: "Simulation prüfen", inquiryTypeKey: "simulationPackage", requestMode: "simulationPackage",
            kunde: { name: "Anna Keller", email: "anna.keller@example.com", phone: "+49 171 9876543", postalCode: "63128", city: "Dietzenbach", street: "", preferredContactTime: "" },
            additionalCustomerInputs: { annualConsumptionKwh: 4200 },
            message: "Laut Simulator würde sich das Sungrow Paket für uns lohnen. Können Sie das kurz prüfen?",
            anfrageweg: { source: "PV-Simulator", sourceUrl: "/pv-simulator", entryPointLabel: "PV-Simulator", ctaLabel: "Simulation unverbindlich prüfen lassen", submittedAt: daysAgo(3) },
            anfrageSnapshot: {
                requestMode: "simulationPackage",
                offerSnapshot: { id: "OFF-006", title: "Sungrow Familien Paket" },
                simulatorInputSnapshot: { annualConsumptionKwh: 4200, selectedPackageId: "OFF-006", selectedPackageTitle: "Sungrow Familien Paket", moduleCount: 18, pvPowerKwp: 9, storageQuantity: 1, storageCapacityKwh: 26.72, manuallyAdjusted: false },
                computedSystemSnapshot: { pvPowerKwp: 9, moduleCount: 18, storageCapacityKwh: 26.72, calculatedAt: daysAgo(3) },
            },
            wirtschaftlichkeitsrechnung: { source: "customerSimulation", inputs: { annualConsumptionKwh: 4200, electricityPriceCt: 34, feedInTariffCt: 7.9, specificYieldKwhPerKwp: 920, observationYears: 20 }, calculated: { annualYieldKwh: 8280, selfUsedEnergyKwh: 3312, fedInEnergyKwh: 4968, eigenverbrauch: 0.4, autarkiegrad: 0.62, yearlySavings: 1126, feedInRevenue: 392, totalYearlyBenefit: 1518, amortizationYears: 9.8 }, assumptionsManuallyAdjusted: false, calculationVersion: "v1", disclaimer: DISCLAIMER },
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(3), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(3), submittedAt: daysAgo(3), userAgent: "Mozilla/5.0", deviceType: "mobile", locale: "de-DE" },
            admin: { assignedTo: null, todo: null, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(3)), log("Status geändert: Gelesen", "Admin", daysAgo(2))] },
        },
        {
            _id: "REQ-0003", schemaVersion: "contactRequest.v1", status: "In Bearbeitung",
            inquiryType: "Kostenlose Beratung", inquiryTypeKey: "freeConsultation", requestMode: "freeConsultation",
            kunde: { name: "Familie Kraus", email: "kraus@example.com", phone: "+49 172 4561230", postalCode: "63110", city: "Rodgau", street: "", preferredContactTime: "Vormittags" },
            additionalCustomerInputs: { desiredCallbackTime: "Vormittags" },
            message: "Wir möchten uns unverbindlich zum Thema PV-Anlage beraten lassen.",
            anfrageweg: { source: "Landing Page", sourceUrl: "/", entryPointLabel: "Hero", ctaLabel: "Kostenlose Beratung anfragen", submittedAt: daysAgo(7) },
            anfrageSnapshot: { requestMode: "freeConsultation", freeConsultationSnapshot: { label: "Kostenfreie Kontaktaufnahme zur gemeinsamen Prüfung der individuellen Anfrage", sourceSection: "Hero", originalUrl: "/" } },
            wirtschaftlichkeitsrechnung: null,
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(7), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(7), submittedAt: daysAgo(7), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: {
                assignedTo: { employeeId: "emp-002", name: "Sabine Krause", email: "sabine.krause@lebe-solarenergie.de", role: "Kundenberatung", assignedAt: daysAgo(6), assignedBy: "Admin" },
                todo: null, internalNotes: [{ id: "note-1", text: "Rückruf für Mittwochnachmittag vereinbart.", authorName: "Sabine Krause", createdAt: daysAgo(6) }],
                activityLog: [log("Anfrage erstellt", "System", daysAgo(7)), log("Mitarbeiter zugewiesen", "Admin", daysAgo(6)), log("E-Mail-Benachrichtigung gesendet", "System", daysAgo(6)), log("Notiz hinzugefügt", "Sabine Krause", daysAgo(6))],
            },
        },
        {
            _id: "REQ-0004", schemaVersion: "contactRequest.v1", status: "To-do",
            inquiryType: "Individuelle Anfrage", inquiryTypeKey: "simulationIndividual", requestMode: "simulationIndividual",
            kunde: { name: "Peter Vogel", email: "peter.vogel@example.com", phone: "", postalCode: "63450", city: "Hanau", street: "", preferredContactTime: "" },
            additionalCustomerInputs: { annualConsumptionKwh: 5200 },
            message: "Ich würde gerne eine individuelle Anlage zusammenstellen, unabhängig von den Standardpaketen.",
            anfrageweg: { source: "PV-Simulator", sourceUrl: "/pv-simulator", entryPointLabel: "PV-Simulator", ctaLabel: "Simulation unverbindlich prüfen lassen", submittedAt: daysAgo(11) },
            anfrageSnapshot: {
                requestMode: "simulationIndividual",
                productsSnapshot: [{ id: "MOD-004", name: "Aiko Neostar 3P+", category: "Solarmodule", quantity: 20, selectedSlot: "solarModule", visibleToCustomer: true }],
                computedSystemSnapshot: { pvPowerKwp: 9.8, moduleCount: 20, calculatedAt: daysAgo(11) },
                simulatorInputSnapshot: { annualConsumptionKwh: 5200, moduleCount: 20, pvPowerKwp: 9.8, manuallyAdjusted: true },
                assumptionsSnapshot: { annualConsumptionKwh: 5200, electricityPriceCt: 35, feedInTariffCt: 7.9, specificYieldKwhPerKwp: 950, manuallyAdjusted: false },
            },
            wirtschaftlichkeitsrechnung: { source: "customerSimulation", inputs: { annualConsumptionKwh: 5200, electricityPriceCt: 35, feedInTariffCt: 7.9, specificYieldKwhPerKwp: 950, observationYears: 20 }, calculated: { annualYieldKwh: 9310, selfUsedEnergyKwh: 3258, fedInEnergyKwh: 6052, eigenverbrauch: 0.35, autarkiegrad: 0.63, yearlySavings: 1140, feedInRevenue: 478, totalYearlyBenefit: 1618, amortizationYears: null }, assumptionsManuallyAdjusted: false, calculationVersion: "v1", disclaimer: DISCLAIMER },
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(11), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(11), submittedAt: daysAgo(11), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: { assignedTo: null, todo: { dueDate: daysAgo(-2).slice(0, 10), note: "Rückmeldung zu individueller Konfiguration ausstehend." }, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(11)), log("Auf To-do gesetzt", "Admin", daysAgo(9))] },
        },
        {
            _id: "REQ-0005", schemaVersion: "contactRequest.v1", status: "Beantwortet",
            inquiryType: "Produktberatung", inquiryTypeKey: "productQuestion", requestMode: "productQuestion",
            kunde: { name: "Julia Herrmann", email: "julia.herrmann@example.com", phone: "+49 173 2223344", postalCode: "63500", city: "Seligenstadt", street: "", preferredContactTime: "" },
            additionalCustomerInputs: {},
            message: "Ist der BYD Speicher mit unserem vorhandenen Fronius Wechselrichter kompatibel?",
            anfrageweg: { source: "Produkte", sourceUrl: "/produkte/sto-001", entryPointLabel: "Produktdetail", ctaLabel: "Beratung zu Komponenten anfragen", submittedAt: daysAgo(20) },
            anfrageSnapshot: { requestMode: "productQuestion", selectedProductSnapshot: { id: "STO-001", name: "BYD Battery-Box HVB 8.9 mit 8,91kWh", category: "Heimspeicher", manufacturer: "BYD", power: 8.91, unit: "kWh", originalUrl: "/produkte/sto-001" } },
            wirtschaftlichkeitsrechnung: null,
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(20), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(20), submittedAt: daysAgo(20), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: {
                assignedTo: { employeeId: "emp-003", name: "Marco Weller", email: "marco.weller@lebe-solarenergie.de", role: "Elektromeister", assignedAt: daysAgo(19), assignedBy: "Admin" },
                todo: null, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(20)), log("Mitarbeiter zugewiesen", "Admin", daysAgo(19)), log("Status geändert: Beantwortet", "Marco Weller", daysAgo(18))],
            },
        },
        {
            _id: "REQ-0006", schemaVersion: "contactRequest.v1", status: "Erledigt",
            inquiryType: "Allgemeine Anfrage", inquiryTypeKey: "generalContact", requestMode: "generalContact",
            kunde: { name: "Michael Sander", email: "michael.sander@example.com", phone: "+49 174 5566778", postalCode: "63549", city: "Ronneburg", street: "", preferredContactTime: "" },
            additionalCustomerInputs: { notes: "Interesse an PV allgemein, noch keine konkreten Pläne." },
            message: "Guten Tag, ich informiere mich allgemein über PV-Anlagen und würde gerne Infomaterial erhalten.",
            anfrageweg: { source: "Kontakt direkt", sourceUrl: "/kontakt", entryPointLabel: "Kontakt", ctaLabel: "Anfrage unverbindlich senden", submittedAt: daysAgo(35) },
            anfrageSnapshot: { requestMode: "generalContact" },
            wirtschaftlichkeitsrechnung: null,
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(35), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(35), submittedAt: daysAgo(35), userAgent: "Mozilla/5.0", deviceType: "mobile", locale: "de-DE" },
            admin: {
                assignedTo: { employeeId: "emp-002", name: "Sabine Krause", email: "sabine.krause@lebe-solarenergie.de", role: "Kundenberatung", assignedAt: daysAgo(34), assignedBy: "Admin" },
                todo: null, internalNotes: [{ id: "note-2", text: "Infomaterial per E-Mail versendet.", authorName: "Sabine Krause", createdAt: daysAgo(33) }],
                activityLog: [log("Anfrage erstellt", "System", daysAgo(35)), log("Mitarbeiter zugewiesen", "Admin", daysAgo(34)), log("Status geändert: Erledigt", "Sabine Krause", daysAgo(33))],
            },
        },
        {
            _id: "REQ-0007", schemaVersion: "contactRequest.v1", status: "Archiviert",
            inquiryType: "Paketprüfung", inquiryTypeKey: "contactPackage", requestMode: "contactPackage",
            kunde: { name: "Firma Blumberg GmbH", email: "info@blumberg-beispiel.de", phone: "+49 6104 112233", postalCode: "63263", city: "Neu-Isenburg", street: "", preferredContactTime: "" },
            additionalCustomerInputs: {},
            message: "Bitte prüfen Sie, ob das Maximal Autark Paket für unser Firmengebäude in Frage kommt.",
            anfrageweg: { source: "Kontakt direkt", sourceUrl: "/kontakt", entryPointLabel: "Kontakt", ctaLabel: "Paket unverbindlich prüfen lassen", submittedAt: daysAgo(90) },
            anfrageSnapshot: { requestMode: "contactPackage", offerSnapshot: { id: "OFF-008", title: "Maximal Autark Komplettpaket" }, computedSystemSnapshot: { pvPowerKwp: 15.2, moduleCount: 32, storageCapacityKwh: 8.28, calculatedAt: daysAgo(90) } },
            wirtschaftlichkeitsrechnung: null,
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(90), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(90), submittedAt: daysAgo(90), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: { assignedTo: null, todo: null, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(90)), log("Anfrage archiviert", "Admin", daysAgo(60))] },
        },
        {
            _id: "REQ-0008", schemaVersion: "contactRequest.v1", status: "Papierkorb",
            inquiryType: "Allgemeine Anfrage", inquiryTypeKey: "knowledgeQuestion", requestMode: "knowledgeQuestion",
            kunde: { name: "Test Eintrag", email: "test@example.com", phone: "", postalCode: "", city: "", street: "", preferredContactTime: "" },
            additionalCustomerInputs: {},
            message: "Testnachricht (Duplikat).",
            anfrageweg: { source: "Wissen", sourceUrl: "/wissen/speicher-lohnt-sich", entryPointLabel: "Wissen", ctaLabel: "Beratung anfragen", submittedAt: daysAgo(120) },
            anfrageSnapshot: { requestMode: "knowledgeQuestion", knowledgeTopicSnapshot: { title: "Wann lohnt sich ein Speicher?", slug: "speicher-lohnt-sich", originalUrl: "/wissen/speicher-lohnt-sich" } },
            wirtschaftlichkeitsrechnung: null,
            attachments: [],
            consent: { privacyAccepted: true, privacyAcceptedAt: daysAgo(120), privacyVersion: "v1" },
            metainformationen: { createdAt: daysAgo(120), submittedAt: daysAgo(120), userAgent: "Mozilla/5.0", deviceType: "desktop", locale: "de-DE" },
            admin: { assignedTo: null, todo: null, internalNotes: [], activityLog: [log("Anfrage erstellt", "System", daysAgo(120)), log("Anfrage in Papierkorb verschoben", "Admin", daysAgo(119))] },
        },
    ];
}

export async function seedIfEmpty(): Promise<void> {
    const productCount = await ProductModel.countDocuments().exec();
    if (productCount > 0) {
        return;
    }

    const manufacturerIdByOldNumber: Record<number, string> = {};
    for (const [oldNumber, data] of Object.entries(manufacturerSeeds)) {
        const created = await ManufacturerModel.create(data);
        manufacturerIdByOldNumber[Number(oldNumber)] = String(created.id);
    }

    const products = productSeeds(manufacturerIdByOldNumber);
    await ProductModel.insertMany(products);
    await SystemComponentModel.insertMany(systemComponentSeeds.map(c => ({ ...c, _id: c._id })));
    await ServiceModel.insertMany(serviceSeeds.map(s => ({ ...s, _id: s._id })));
    await RequirementTemplateModel.insertMany(requirementTemplateSeeds.map(r => ({ ...r, _id: r._id })));
    await OfferModel.insertMany(offerSeeds());
    await ProjectInsightModel.insertMany(projectInsightSeeds);
    await ContactRequestModel.insertMany(contactRequestSeeds());
    await EmployeeModel.insertMany(employeeSeeds);

    logger.info(`Seeded ${Object.keys(manufacturerSeeds).length} manufacturers, ${products.length} products, ${systemComponentSeeds.length} system components, ${serviceSeeds.length} services, ${requirementTemplateSeeds.length} requirement templates, ${offerSeeds().length} offers, ${projectInsightSeeds.length} project insights, ${contactRequestSeeds().length} contact requests, ${employeeSeeds.length} employees.`);
}
