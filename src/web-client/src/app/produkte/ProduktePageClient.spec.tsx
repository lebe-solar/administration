import { render, screen, fireEvent } from '@testing-library/react';
import { ProduktePageClient } from './ProduktePageClient';
import type { ProductsPageData } from '@/lib/types';

function makeData(overrides: Partial<ProductsPageData> = {}): ProductsPageData {
  const solarProduct = {
    id: 'P-1', name: 'AIKO Neostar 3S+ 475 W', category: 'Solarmodule' as const, manufacturer: 'Aiko',
    power: 475, unit: 'W', warranty: '30 Jahre', logo: '/assets/brands/aiko_logo.svg', image: '/assets/products/aiko-neostar.png',
    beschreibung: 'Hocheffizientes Modul.', specPdf: null, panelHeightMeters: 1.9, panelWidthMeters: 1.1, updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const inverterProduct = {
    id: 'P-2', name: 'Fronius Symo GEN24', category: 'Wechselrichter' as const, manufacturer: 'Fronius',
    power: 10, unit: 'kW', warranty: '10 Jahre', logo: null, image: null,
    beschreibung: 'Hybridwechselrichter.', specPdf: null, panelHeightMeters: null, panelWidthMeters: null, updatedAt: '2026-01-01T00:00:00.000Z',
  };

  return {
    schemaVersion: 'productsPage.v1',
    generatedAt: '2026-01-01T00:00:00.000Z',
    products: [solarProduct, inverterProduct],
    manufacturers: [
      { id: 'M-1', name: 'Aiko', logo: '/assets/brands/aiko_logo.svg', description: 'Weltmarktführer für ABC-Zellen.', link: '', linkedProducts: 1 },
      { id: 'M-2', name: 'Fronius', logo: null, description: '', link: '', linkedProducts: 1 },
    ],
    groupedProducts: [
      { category: 'Solarmodule', label: 'Solarmodule', products: [solarProduct] },
      { category: 'Wechselrichter', label: 'Wechselrichter', products: [inverterProduct] },
      { category: 'Heimspeicher', label: 'Heimspeicher', products: [] },
      { category: 'Ladestationen', label: 'Ladestationen', products: [] },
      { category: 'Heizsysteme', label: 'Heizsysteme', products: [] },
    ],
    ...overrides,
  };
}

describe('ProduktePageClient', () => {
  it('renders product names from the fetched data in the page content', () => {
    render(<ProduktePageClient data={makeData()} />);
    expect(screen.getByText('AIKO Neostar 3S+ 475 W')).toBeInTheDocument();
    expect(screen.getByText('Fronius Symo GEN24')).toBeInTheDocument();
  });

  it('offers a filter pill for every product category, and filters products by category on click', () => {
    render(<ProduktePageClient data={makeData()} />);
    expect(screen.getByText('Solarmodule')).toBeInTheDocument();
    expect(screen.getByText('Wechselrichter')).toBeInTheDocument();
    expect(screen.getByText('Heimspeicher')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Wechselrichter'));
    expect(screen.getByText('Fronius Symo GEN24')).toBeInTheDocument();
    expect(screen.queryByText('AIKO Neostar 3S+ 475 W')).not.toBeInTheDocument();
  });

  it('shows every manufacturer from the fetched data as a filter option', () => {
    render(<ProduktePageClient data={makeData()} />);
    expect(screen.getByText('Aiko')).toBeInTheDocument();
    expect(screen.getByText('Fronius')).toBeInTheDocument();
  });

  it('renders exactly the products the (already-filtered) API response provides — no client-side Status field exists to leak Draft/Hidden products', () => {
    const data = makeData();
    render(<ProduktePageClient data={data} />);
    const rendered = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
    expect(rendered).toHaveLength(data.products.length);
    // Draft/Hidden exclusion itself is enforced server-side and covered by
    // src/web-client-api/src/routes/productsPage.spec.ts — this type has no status field at all.
    expect(data.products[0]).not.toHaveProperty('status');
  });

  it('renders the empty state when the API returned no products', () => {
    render(<ProduktePageClient data={makeData({ products: [], groupedProducts: makeData().groupedProducts.map(g => ({ ...g, products: [] })) })} />);
    expect(screen.getByText('Aktuell sind keine Produkte veröffentlicht.')).toBeInTheDocument();
  });

  it('renders the error state when the build-time fetch failed', () => {
    render(<ProduktePageClient data={makeData({ fetchError: true })} />);
    expect(screen.getByText('Produkte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')).toBeInTheDocument();
    expect(screen.queryByText('Hersteller')).not.toBeInTheDocument();
  });

  it('keeps the page structure: heading, breadcrumb, filter sections, and closing CTA', () => {
    render(<ProduktePageClient data={makeData()} />);
    expect(screen.getByRole('heading', { name: 'Unsere Produkte', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Hersteller')).toBeInTheDocument();
    expect(screen.getByText('Produkttyp')).toBeInTheDocument();
    expect(screen.getByText('Unsicher, welche Komponente passt?')).toBeInTheDocument();
    expect(screen.getByText('Beratung zu Komponenten anfragen')).toBeInTheDocument();
  });
});
