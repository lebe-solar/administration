import { api } from './client';
import type { SystemComponent } from '../types';

export const systemComponentsApi = {
  list: () => api.get<SystemComponent[]>('/system-components'),
  get: (id: string) => api.get<SystemComponent>(`/system-components/${id}`),
  create: (data: Partial<SystemComponent>) => api.post<SystemComponent>('/system-components', data),
  update: (id: string, data: Partial<SystemComponent>) => api.put<SystemComponent>(`/system-components/${id}`, data),
  remove: (id: string) => api.del<void>(`/system-components/${id}`),
};
