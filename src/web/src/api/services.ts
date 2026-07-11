import { api } from './client';
import type { Service } from '../types';

export const servicesApi = {
  list: () => api.get<Service[]>('/services'),
  get: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: Partial<Service>) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  duplicate: (id: string) => api.post<Service>(`/services/${id}/duplicate`),
  remove: (id: string) => api.del<void>(`/services/${id}`),
};
