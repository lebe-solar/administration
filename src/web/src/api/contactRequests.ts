import { api } from './client';
import type { ContactRequest, RequestStatus } from '../types';

export interface ContactRequestFilters {
  status?: string;
  requestMode?: string;
  source?: string;
  assignedTo?: string;
  from?: string;
  to?: string;
  plz?: string;
  hasPackage?: boolean;
  hasSimulation?: boolean;
  hasAttachments?: boolean;
  unreadOnly?: boolean;
  todoOnly?: boolean;
  q?: string;
}

function toQuery(filters: ContactRequestFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === '' || v === 'all' || v === false) return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const contactRequestsApi = {
  list: (filters: ContactRequestFilters = {}) => api.get<ContactRequest[]>(`/contact-requests${toQuery(filters)}`),
  get: (id: string) => api.get<ContactRequest>(`/contact-requests/${id}`),
  setStatus: (id: string, status: RequestStatus, todo?: { dueDate?: string; note?: string }) =>
    api.patch<ContactRequest>(`/contact-requests/${id}/status`, { status, todo }),
  assign: (id: string, employeeId: string, assignedBy?: string, keepStatus?: boolean) =>
    api.patch<ContactRequest & { emailOk: boolean }>(`/contact-requests/${id}/assign`, { employeeId, assignedBy, keepStatus }),
  addNote: (id: string, text: string, authorName?: string) =>
    api.post<ContactRequest>(`/contact-requests/${id}/notes`, { text, authorName }),
  archive: (id: string) => api.patch<ContactRequest>(`/contact-requests/${id}/archive`),
  trash: (id: string) => api.patch<ContactRequest>(`/contact-requests/${id}/trash`),
};
