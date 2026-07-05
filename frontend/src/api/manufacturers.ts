import { api } from './client';
import type { Manufacturer } from '../types';

export const manufacturersApi = {
  list: () => api.get<Manufacturer[]>('/manufacturers'),
  create: (data: Partial<Manufacturer>) => api.post<Manufacturer>('/manufacturers', data),
  update: (id: number, data: Partial<Manufacturer>) => api.put<Manufacturer>(`/manufacturers/${id}`, data),
  remove: (id: number) => api.del<void>(`/manufacturers/${id}`),
};
