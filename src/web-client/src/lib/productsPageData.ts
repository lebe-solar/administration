// Build-time data loader for the /produkte page. Fetches from the separate, public,
// read-only src/web-client-api (never the Admin API) so the statically-exported page's HTML
// contains real product content for SEO — see src/app/produkte/page.tsx (a Server Component)
// and ProduktePageClient.tsx (the client-side filter UI it renders).
import { categories as mockCategories, products as mockProducts } from './mockData';
import type { ProductsPageData, ProductsPageManufacturer, ProductsPageProduct } from './types';

function emptyData(fetchError: boolean): ProductsPageData {
  return {
    schemaVersion: 'productsPage.v1',
    generatedAt: new Date().toISOString(),
    products: [],
    manufacturers: [],
    groupedProducts: mockCategories.map((c) => ({ category: c.key, label: c.label, products: [] })),
    fetchError,
  };
}

/**
 * Development-only fallback, built from the same local mock data the rest of the site (and
 * this app's original prototype) used before the real API existed. Only used when
 * WEB_CLIENT_API_BASE_URL isn't set or the fetch fails, and only outside production — see the
 * NODE_ENV checks in getProductsPageData(). Must never be reached silently in production.
 */
function buildDevFallbackData(): ProductsPageData {
  const products: ProductsPageProduct[] = mockProducts.map((p) => ({
    id: p.id,
    name: p.header,
    category: p.category,
    manufacturer: p.hersteller,
    power: p.power,
    unit: p.unit,
    warranty: p.garantie,
    logo: p.logo || null,
    image: p.image || null,
    beschreibung: p.beschreibung,
    specPdf: null,
    panelHeightMeters: null,
    panelWidthMeters: null,
    updatedAt: new Date().toISOString(),
  }));

  const manufacturerNames = Array.from(new Set(products.map((p) => p.manufacturer).filter(Boolean)));
  const manufacturers: ProductsPageManufacturer[] = manufacturerNames.map((name, i) => ({
    id: `dev-fallback-${i}`,
    name,
    logo: products.find((p) => p.manufacturer === name)?.logo || null,
    description: '',
    link: '',
    linkedProducts: products.filter((p) => p.manufacturer === name).length,
  }));

  const groupedProducts = mockCategories.map((c) => ({
    category: c.key,
    label: c.label,
    products: products.filter((p) => p.category === c.key),
  }));

  return {
    schemaVersion: 'productsPage.v1',
    generatedAt: new Date().toISOString(),
    products,
    manufacturers,
    groupedProducts,
  };
}

export async function getProductsPageData(): Promise<ProductsPageData> {
  const baseUrl = process.env.WEB_CLIENT_API_BASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!baseUrl) {
    if (isProduction) {
      // Loud, build-log-visible failure — never a silent empty/mock page in production.
      console.error('[productsPageData] WEB_CLIENT_API_BASE_URL is not set in a production build. The Produkte page will render its error state.');
      return emptyData(true);
    }
    console.warn('[productsPageData] WEB_CLIENT_API_BASE_URL is not set — using local mock data. This is a development-only fallback and must never happen in production.');
    return buildDevFallbackData();
  }

  try {
    // Default (`force-cache`-equivalent) fetch caching — this is a one-shot, build-time-only
    // fetch under static export (`output: 'export'`), not a per-request revalidation. The
    // whole site is fully rebuilt by the publish workflow whenever public content changes, so
    // there is no need for (and `output: 'export'` cannot support) runtime revalidation here.
    const res = await fetch(`${baseUrl}/products-page`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`products-page request failed with status ${res.status}: ${body}`);
    }
    return (await res.json()) as ProductsPageData;
  } catch (err) {
    console.error(`[productsPageData] Failed to fetch products-page data from ${baseUrl}:`, err);
    if (!isProduction) {
      console.warn('[productsPageData] Falling back to local mock data. This is a development-only fallback and must never happen in production.');
      return buildDevFallbackData();
    }
    return emptyData(true);
  }
}
