/**
 * Offline queue for pending time_records writes.
 * Each entry is idempotent through `client_id` (uuid) so retries never duplicate rows.
 * Synchronization uses upsert per (user_id, date) — see useOfflineSync.
 */
import { get, set, del, keys } from 'idb-keyval';

export type OfflineAction = 'clock_in' | 'lunch_start' | 'lunch_end' | 'clock_out';

export interface OfflineEntry {
  client_id: string;
  user_id: string;
  date: string;            // YYYY-MM-DD
  action: OfflineAction;
  action_time: string;     // HH:MM
  locations: Record<string, any>;
  created_at: string;      // ISO
  attempts: number;
  last_error?: string;
  status: 'pending' | 'failed';
}

const PREFIX = 'tcponto:offline-queue:';
const keyFor = (clientId: string) => `${PREFIX}${clientId}`;

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function enqueueRegistration(
  entry: Omit<OfflineEntry, 'client_id' | 'created_at' | 'attempts' | 'status'>
): Promise<OfflineEntry> {
  const existingQueue = await listQueue();
  const existing = existingQueue.find((queued) =>
    queued.user_id === entry.user_id &&
    queued.date === entry.date &&
    queued.action === entry.action
  );
  if (existing) return existing;

  const full: OfflineEntry = {
    ...entry,
    client_id: uuid(),
    created_at: new Date().toISOString(),
    attempts: 0,
    status: 'pending',
  };
  await set(keyFor(full.client_id), full);
  return full;
}

export async function listQueue(): Promise<OfflineEntry[]> {
  const allKeys = await keys();
  const queueKeys = (allKeys as string[]).filter((k) => typeof k === 'string' && k.startsWith(PREFIX));
  const items = await Promise.all(queueKeys.map((k) => get<OfflineEntry>(k as string)));
  return items.filter((x): x is OfflineEntry => !!x).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function countPending(): Promise<number> {
  const items = await listQueue();
  return items.filter((x) => x.status === 'pending').length;
}

export async function removeEntry(clientId: string): Promise<void> {
  await del(keyFor(clientId));
}

export async function updateEntry(entry: OfflineEntry): Promise<void> {
  await set(keyFor(entry.client_id), entry);
}
