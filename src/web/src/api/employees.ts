import { api } from './client';
import type { Employee } from '../types';

export const employeesApi = {
  list: () => api.get<Employee[]>('/employees'),
};
