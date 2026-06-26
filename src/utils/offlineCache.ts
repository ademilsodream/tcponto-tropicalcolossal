/**
 * Offline cache for time registration:
 * - allowed_locations (already filtered to active)
 * - work shift schedule + tolerances for the day
 *
 * Stored in IndexedDB via idb-keyval, keyed by user id.
 * Used by the location and shift validation hooks when the device is offline.
 */
import { get, set, del } from 'idb-keyval';
import type { AllowedLocation } from '@/types/index';

export interface CachedShiftData {
  hasShift: boolean;
  // schedules indexed by day_of_week (0-6)
  schedules: Record<number, {
    start_time: string | null;
    break_start_time: string | null;
    break_end_time: string | null;
    end_time: string | null;
  }>;
  tolerances: {
    early_tolerance_minutes: number;
    late_tolerance_minutes: number;
    break_tolerance_minutes: number;
  };
  shiftName?: string;
}

export interface OfflineCachePayload {
  userId: string;
  allowedLocations: AllowedLocation[];
  shift: CachedShiftData | null;
  cachedAt: number; // epoch ms
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const keyFor = (userId: string) => `tcponto:offline-cache:${userId}`;

export async function saveOfflineCache(payload: OfflineCachePayload): Promise<void> {
  try {
    await set(keyFor(payload.userId), payload);
  } catch (e) {
    console.warn('[offlineCache] save failed', e);
  }
}

export async function loadOfflineCache(userId: string): Promise<OfflineCachePayload | null> {
  try {
    const data = await get<OfflineCachePayload>(keyFor(userId));
    return data || null;
  } catch (e) {
    console.warn('[offlineCache] load failed', e);
    return null;
  }
}

export async function clearOfflineCache(userId: string): Promise<void> {
  try {
    await del(keyFor(userId));
  } catch {}
}

export function isCacheFresh(payload: OfflineCachePayload | null): boolean {
  if (!payload) return false;
  return Date.now() - payload.cachedAt <= CACHE_TTL_MS;
}

export function ageInDays(payload: OfflineCachePayload | null): number | null {
  if (!payload) return null;
  return Math.floor((Date.now() - payload.cachedAt) / (24 * 60 * 60 * 1000));
}
