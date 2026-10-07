import { supabase } from '@/integrations/supabase/client';
import type { AllowedLocation } from '@/types/index';

/** Formata linhas de allowed_locations vindas do Supabase. */
export function formatAllowedLocations(rows: any[]): AllowedLocation[] {
  return (rows || []).map((loc) => ({
    ...loc,
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
    range_meters: Number(loc.range_meters),
  }));
}

/**
 * Se o RH cadastrou restrições, só essas obras entram no GPS.
 * Sem nenhuma linha de restrição, mantém todas as obras ativas (compatível com instalações antigas).
 */
export function filterAllowedLocationsByRestrictions(
  locations: AllowedLocation[],
  restrictedLocationIds: string[]
): AllowedLocation[] {
  if (restrictedLocationIds.length === 0) return locations;
  const allowed = new Set(restrictedLocationIds);
  return locations.filter((loc) => allowed.has(loc.id));
}

export async function fetchRestrictionLocationIds(employeeId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('location_employee_restrictions')
    .select('location_id')
    .eq('employee_id', employeeId);

  if (error) throw error;
  return (data || []).map((row) => row.location_id).filter(Boolean);
}

export async function fetchAllowedLocationsForEmployee(employeeId: string): Promise<AllowedLocation[]> {
  const { data, error } = await supabase
    .from('allowed_locations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  const formatted = formatAllowedLocations(data);
  const restrictedIds = await fetchRestrictionLocationIds(employeeId);
  return filterAllowedLocationsByRestrictions(formatted, restrictedIds);
}
