import { api } from './client';
import type { Offer, OfferItem } from '../types';

export interface OfferFilters {
  status?: string;
  price?: string;
  valid?: string;
  q?: string;
}

function toQuery(filters: OfferFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v); });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const offersApi = {
  list: (filters: OfferFilters = {}) => api.get<Offer[]>(`/offers${toQuery(filters)}`),
  get: (id: string) => api.get<Offer>(`/offers/${id}`),
  nextId: () => api.get<{ id: string }>('/offers/next-id'),
  create: (data: Partial<Offer>) => api.post<Offer>('/offers', data),
  update: (id: string, data: Partial<Offer>) => api.put<Offer>(`/offers/${id}`, data),
  duplicate: (id: string) => api.post<Offer>(`/offers/${id}/duplicate`),
  remove: (id: string) => api.del<void>(`/offers/${id}`),
};

export const offerComponentsApi = {
  list: () => api.get<OfferItem[]>('/offer-components'),
  create: (data: Partial<OfferItem>) => api.post<OfferItem>('/offer-components', data),
  update: (id: string, data: Partial<OfferItem>) => api.put<OfferItem>(`/offer-components/${id}`, data),
  duplicate: (id: string) => api.post<OfferItem>(`/offer-components/${id}/duplicate`),
  remove: (id: string) => api.del<void>(`/offer-components/${id}`),
};
