/**
 * @jest-environment node
 */
import { getProductsPageData } from './productsPageData';

const ORIGINAL_ENV = process.env;

function mockFetchOnce(response: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getProductsPageData', () => {
  it('fetches from WEB_CLIENT_API_BASE_URL/products-page and returns the parsed response', async () => {
    process.env.WEB_CLIENT_API_BASE_URL = 'http://localhost:4100/api';
    const apiResponse = {
      schemaVersion: 'productsPage.v1',
      generatedAt: '2026-01-01T00:00:00.000Z',
      products: [{ id: 'P-1', name: 'Testmodul', category: 'Solarmodule', manufacturer: 'Aiko', power: 400, unit: 'W', warranty: '25 Jahre', logo: null, image: null, beschreibung: '', specPdf: null, panelHeightMeters: null, panelWidthMeters: null, updatedAt: '2026-01-01T00:00:00.000Z' }],
      manufacturers: [],
      groupedProducts: [],
    };
    mockFetchOnce(apiResponse);

    const data = await getProductsPageData();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4100/api/products-page');
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe('Testmodul');
    expect(data.fetchError).toBeUndefined();
  });

  it('never falls back to mock data in production, even when the API base URL is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.WEB_CLIENT_API_BASE_URL;

    const data = await getProductsPageData();

    expect(data.products).toEqual([]);
    expect(data.fetchError).toBe(true);
  });

  it('never falls back to mock data in production when the fetch itself fails', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WEB_CLIENT_API_BASE_URL = 'http://localhost:4100/api';
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;

    const data = await getProductsPageData();

    expect(data.products).toEqual([]);
    expect(data.fetchError).toBe(true);
  });

  it('falls back to local mock data only outside production, and never silently', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.WEB_CLIENT_API_BASE_URL;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const data = await getProductsPageData();

    expect(data.products.length).toBeGreaterThan(0); // real mock catalog has entries
    expect(data.fetchError).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled(); // must assert before mockRestore() — restoring clears call history

    warnSpy.mockRestore();
  });
});
