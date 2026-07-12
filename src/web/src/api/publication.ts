import { api } from './client';
import type { PublicationOverview, PublicWebClientDeployment } from '../types';

export const publicationApi = {
  overview: () => api.get<PublicationOverview>('/admin/publication/overview'),
  publish: (data?: { reason?: string; includePendingChanges?: boolean }) =>
    api.post<PublicWebClientDeployment>('/admin/publication/publish', data || {}),
  refreshStatus: (id: string) => api.post<PublicWebClientDeployment>(`/admin/publication/deployments/${id}/refresh-status`),
  history: (limit = 10) => api.get<PublicWebClientDeployment[]>(`/admin/publication/deployments?limit=${limit}`),
};
