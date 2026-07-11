import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DankeContent } from './DankeContent';

export const metadata: Metadata = {
  title: 'Vielen Dank',
  description: 'Ihre Anfrage bei LeBe Solarenergie ist eingegangen.',
};

export default function DankePage() {
  return (
    <Suspense fallback={null}>
      <DankeContent />
    </Suspense>
  );
}
