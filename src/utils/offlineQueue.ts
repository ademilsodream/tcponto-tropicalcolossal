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
  next_attempt_at?: string; // ISO — backoff exponencial entre tentativas
  status: 'pending' | 'failed';
}

const PREFIX = 'tcponto:offline-queue:';
const INDEX_KEY = 'tcponto:offline-queue-index';
const keyFor = (clientId: string) => `${PREFIX}${clientId}`;

const BACKOFF_STEPS_MS = [15_000, 60_000, 300_000, 900_000, 1_800_000];

/** Atraso até a próxima tentativa, saturando em 30 min. */
export function backoffDelayMs(attempts: number): number {
  return BACKOFF_STEPS_MS[Math.min(attempts, BACKOFF_STEPS_MS.length - 1)];
}

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

async function writeIndex(ids: string[]): Promise<void> {
  await set(INDEX_KEY, Array.from(new Set(ids)));
}

/** Reconstrói o índice varrendo o IndexedDB — só na primeira carga ou se ele sumir. */
async function rebuildIndex(): Promise<string[]> {
  const allKeys = await keys();
  const ids = (allKeys as unknown[])
    .filter((k): k is string => typeof k === 'string' && k.startsWith(PREFIX))
    .map((k) => k.slice(PREFIX.length));
  await writeIndex(ids);
  return ids;
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
  await writeIndex([...existingQueue.map((q) => q.client_id), full.client_id]);
  return full;
}

export async function listQueue(): Promise<OfflineEntry[]> {
  const index = await get<string[]>(INDEX_KEY);
  const ids = Array.isArray(index) ? index : await rebuildIndex();

  const items = await Promise.all(ids.map((id) => get<OfflineEntry>(keyFor(id))));
  const alive = items.filter((x): x is OfflineEntry => !!x);
  if (alive.length !== ids.length) await writeIndex(alive.map((x) => x.client_id));

  return alive.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * Pontos ainda não entregues ao servidor. Inclui `failed`: eles continuam
 * pendentes para o funcionário mesmo depois de esgotarem as tentativas.
 */
export async function countPending(): Promise<number> {
  const items = await listQueue();
  return items.filter((x) => x.status === 'pending' || x.status === 'failed').length;
}

/** Entradas cujo backoff já venceu. */
export async function listDueEntries(now: number = Date.now()): Promise<OfflineEntry[]> {
  const items = await listQueue();
  return items.filter((x) => !x.next_attempt_at || Date.parse(x.next_attempt_at) <= now);
}

/** Volta os `failed` para `pending` — usado quando a conexão retorna. */
export async function requeueFailed(): Promise<number> {
  const items = await listQueue();
  const failed = items.filter((x) => x.status === 'failed');
  await Promise.all(
    failed.map((entry) =>
      set(keyFor(entry.client_id), { ...entry, status: 'pending' as const, next_attempt_at: undefined })
    )
  );
  return failed.length;
}

export async function removeEntry(clientId: string): Promise<void> {
  await del(keyFor(clientId));
  const index = await get<string[]>(INDEX_KEY);
  if (Array.isArray(index)) {
    await writeIndex(index.filter((id) => id !== clientId));
  }
}

export async function updateEntry(entry: OfflineEntry): Promise<void> {
  await set(keyFor(entry.client_id), entry);
  const index = await get<string[]>(INDEX_KEY);
  if (Array.isArray(index) && !index.includes(entry.client_id)) {
    await writeIndex([...index, entry.client_id]);
  }
}
