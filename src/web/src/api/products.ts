import { api } from './client';
import type { Category, Product } from '../types';

export interface ProductInput {
  id: string;
  category: Category['key'];
  Header: string;
  Beschreibung: string;
  manufacturer_id?: string;
  Garantie: string;
  Power: string | number | null;
  Unit: string;
  Spezifikation: string | null;
  Logo: string | null;
  Status: Product['Status'];
  panelHeightMeters: string | number | null;
  panelWidthMeters: string | number | null;
}

export const productsApi = {
  list: () => api.get<Product[]>('/products'),
  get: (id: string) => api.get<Product>(`/products/${id}`),
  nextId: (category: string) => api.get<{ id: string }>(`/products/next-id?category=${encodeURIComponent(category)}`),
  create: (data: ProductInput) => api.post<Product>('/products', data),
  update: (id: string, data: ProductInput) => api.put<Product>(`/products/${id}`, data),
  remove: (id: string) => api.del<void>(`/products/${id}`),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
};
