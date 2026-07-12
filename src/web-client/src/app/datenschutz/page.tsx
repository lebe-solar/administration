import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'Datenschutz' };

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      sections={[
        { heading: '1. Verantwortlicher', body: 'Verantwortlicher im Sinne der DSGVO ist die LeBe Solarenergie GmbH, Fichtenweg 4D, 63322 Rödermark, kontakt@lebe-solarenergie.de.' },
        { heading: '2. Erhebung und Verarbeitung von Daten', body: 'Wenn Sie unser Kontakt- oder Angebotsformular nutzen, verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, Adresse, Verbrauchsdaten, Kontaktdaten) ausschließlich zur Bearbeitung Ihrer Anfrage und zur Erstellung eines Angebots.' },
        { heading: '3. Rechtsgrundlage', body: 'Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie – soweit erforderlich – auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO.' },
        { heading: '4. Speicherdauer', body: 'Ihre Daten werden gelöscht, sobald sie für die genannten Zwecke nicht mehr erforderlich sind, spätestens nach Ablauf gesetzlicher Aufbewahrungsfristen.' },
        { heading: '5. Ihre Rechte', body: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten. Wenden Sie sich hierzu an die oben genannte Adresse.' },
      ]}
      disclaimer="Diese Erklärung ist ein Platzhalter und ersetzt keine rechtliche Prüfung durch einen Datenschutzbeauftragten oder Rechtsanwalt."
    />
  );
}
