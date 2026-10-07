import type { TimeRecordKey } from '@/types/timeRegistration';

export type LocationEntry = {
  locationName?: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
};

/** Mescla uma nova batida no JSON locations sem apagar obras das outras ações. */
export function mergeTimeRecordLocations(
  existing: Record<string, LocationEntry> | null | undefined,
  action: TimeRecordKey,
  entry: LocationEntry
): Record<string, LocationEntry> {
  return {
    ...(existing || {}),
    [action]: entry,
  };
}

/** Preserva entradas de quatro obras distintas após vários merges (cenário multi-obra no mesmo dia). */
export function mergeMultipleActions(
  actions: Array<{ action: TimeRecordKey; entry: LocationEntry }>
): Record<string, LocationEntry> {
  return actions.reduce(
    (acc, { action, entry }) => mergeTimeRecordLocations(acc, action, entry),
    {} as Record<string, LocationEntry>
  );
}
