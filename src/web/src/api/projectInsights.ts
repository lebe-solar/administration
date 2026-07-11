import { api } from './client';
import type { ProjectInsight } from '../types';

export interface ProjectInsightFilters {
  status?: string;
  buildingType?: string;
  customerType?: string;
  q?: string;
}

function toQuery(filters: ProjectInsightFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v); });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const projectInsightsApi = {
  list: (filters: ProjectInsightFilters = {}) => api.get<ProjectInsight[]>(`/project-insights${toQuery(filters)}`),
  get: (id: string) => api.get<ProjectInsight>(`/project-insights/${id}`),
  nextId: () => api.get<{ id: string }>('/project-insights/next-id'),
  create: (data: Partial<ProjectInsight>) => api.post<ProjectInsight>('/project-insights', data),
  update: (id: string, data: Partial<ProjectInsight>) => api.put<ProjectInsight>(`/project-insights/${id}`, data),
  duplicate: (id: string) => api.post<ProjectInsight>(`/project-insights/${id}/duplicate`),
  archive: (id: string) => api.patch<ProjectInsight>(`/project-insights/${id}/archive`),
  remove: (id: string) => api.del<void>(`/project-insights/${id}`),
};
