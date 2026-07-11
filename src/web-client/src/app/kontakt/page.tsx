import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KontaktForm } from './KontaktForm';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktieren Sie LeBe Solarenergie für eine unverbindliche Beratung oder Angebotsprüfung.',
};

export default function KontaktPage() {
  return (
    <Suspense fallback={null}>
      <KontaktForm />
    </Suspense>
  );
}
