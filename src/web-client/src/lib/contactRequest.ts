// Mock contact-request submission. Builds the same payload shape the admin's
// (already-implemented, unauthenticated) POST /contact-requests endpoint
// expects, but does not call it — that wiring is an explicit "second step".
// For now, submissions are logged to the console and persisted to
// localStorage only, so the /danke page and any later debugging can inspect
// what would have been sent.

import type { ContactRequestPayload } from './types';

const STORAGE_KEY = 'lebe_contact_requests_mock';

export interface MockContactRequestRecord extends ContactRequestPayload {
  id: string;
  createdAt: string;
}

function readAll(): MockContactRequestRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockContactRequestRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: MockContactRequestRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Mock submit — persists locally only, no network call. */
export async function submitContactRequest(payload: ContactRequestPayload): Promise<MockContactRequestRecord> {
  const record: MockContactRequestRecord = {
    ...payload,
    id: 'mock-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
  };

  console.info('[mock] contact request submitted (no backend call yet):', record);

  const all = readAll();
  all.push(record);
  writeAll(all);

  // simulate a small network round-trip so the UI can show a pending state
  await new Promise((resolve) => setTimeout(resolve, 400));

  return record;
}

export function getMockContactRequests(): MockContactRequestRecord[] {
  return readAll();
}
