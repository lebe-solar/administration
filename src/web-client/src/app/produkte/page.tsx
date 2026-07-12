import type { Metadata } from 'next';
import { getProductsPageData } from '@/lib/productsPageData';
import { ProduktePageClient } from './ProduktePageClient';

export const metadata: Metadata = {
  title: 'Produkte',
  description: 'Alle Solarmodule, Wechselrichter, Speicher, Ladestationen und Heizsysteme, mit denen LeBe Solarenergie arbeitet.',
};

// Server Component: fetches real product data at build time (static export) so product names,
// descriptions, and specs are present in the generated HTML for SEO — not loaded client-side
// via useEffect. The interactive manufacturer/category filtering lives in the client child.
export default async function ProduktePage() {
  const data = await getProductsPageData();
  return <ProduktePageClient data={data} />;
}
