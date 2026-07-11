import { api } from './client';
import type { RequirementTemplate } from '../types';

export const requirementTemplatesApi = {
  list: () => api.get<RequirementTemplate[]>('/requirement-templates'),
  create: (data: Partial<RequirementTemplate>) => api.post<RequirementTemplate>('/requirement-templates', data),
  remove: (id: string) => api.del<void>(`/requirement-templates/${id}`),
};
