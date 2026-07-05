import config from '../config';
import { getIdToken } from '../auth/getToken';

export class ApiError extends Error {
  errors?: Record<string, string>;
  status: number;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${config.api.baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(await authHeader()), ...(options.headers || {}) },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error || 'Ein Fehler ist aufgetreten', res.status, body.errors);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function uploadFile(kind: 'pdf' | 'image' | 'logo', file: File): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${config.api.baseUrl}/uploads/${kind}`, { method: 'POST', body: form, headers: await authHeader() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || 'Upload fehlgeschlagen', res.status);
  return body;
}
