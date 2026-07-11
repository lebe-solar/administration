import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      sections={[
        { heading: 'Angaben gemäß § 5 TMG', body: <>LeBe Solarenergie GmbH<br />Fichtenweg 4D<br />63322 Rödermark</> },
        { heading: 'Kontakt', body: <>E-Mail: kontakt@lebe-solarenergie.de<br />Web: www.LeBe-Solarenergie.de</> },
        { heading: 'Vertretungsberechtigt', body: 'Geschäftsführung: Jonathan Leu' },
        { heading: 'Registereintrag', body: <>Handelsregister: Amtsgericht Offenbach am Main<br />Registernummer: HRB 54727</> },
        { heading: 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV', body: 'Jonathan Leu, Anschrift wie oben' },
      ]}
    />
  );
}
