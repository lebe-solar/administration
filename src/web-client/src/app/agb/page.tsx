import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'AGB' };

export default function AgbPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen"
      sections={[
        { heading: '§ 1 Geltungsbereich', body: 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der LeBe Solarenergie GmbH und ihren Kunden über Planung, Lieferung und Installation von Photovoltaikanlagen und Zubehör.' },
        { heading: '§ 2 Vertragsschluss', body: 'Ein Angebot auf unserer Plattform stellt eine unverbindliche Aufforderung zur Anfrage dar. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung nach individueller Vor-Ort-Prüfung zustande.' },
        { heading: '§ 3 Preise und Zahlungsbedingungen', body: 'Genannte Komplettpreise verstehen sich inklusive gesetzlicher Umsatzsteuer und beziehen sich auf die im Angebot beschriebenen Standardbedingungen. Abweichungen (z. B. Dachzustand, Netzanschluss) können zu Anpassungen führen und werden vorab kommuniziert.' },
        { heading: '§ 4 Lieferung und Installation', body: 'Die Installation erfolgt durch eigenes Fachpersonal ohne Subunternehmer. Liefertermine werden nach Vertragsschluss individuell abgestimmt.' },
        { heading: '§ 5 Gewährleistung', body: 'Es gelten die gesetzlichen Gewährleistungsrechte sowie zusätzliche Herstellergarantien auf Module, Wechselrichter und Speicher gemäß den jeweiligen Herstellerbedingungen.' },
        { heading: '§ 6 Widerrufsrecht', body: 'Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen nach Vertragsschluss zu. Nähere Informationen erhalten Sie mit der Auftragsbestätigung.' },
      ]}
      disclaimer="Diese AGB sind ein Platzhalter und ersetzen keine rechtliche Prüfung durch einen Rechtsanwalt."
    />
  );
}
