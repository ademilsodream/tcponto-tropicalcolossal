import { describe, expect, it } from 'vitest';
import { filterAllowedLocationsByRestrictions } from './employeeAllowedLocations';
import { mergeMultipleActions, mergeTimeRecordLocations } from './timeRecordLocations';

describe('mergeTimeRecordLocations', () => {
  it('preserva obras distintas por batida no mesmo dia', () => {
    let locations = mergeTimeRecordLocations(undefined, 'clock_in', {
      locationName: 'Obra A',
      locationId: 'a',
    });
    locations = mergeTimeRecordLocations(locations, 'clock_out', {
      locationName: 'Obra B',
      locationId: 'b',
    });

    expect(locations.clock_in?.locationName).toBe('Obra A');
    expect(locations.clock_out?.locationName).toBe('Obra B');
  });

  it('mantém quatro entradas após merges sequenciais', () => {
    const merged = mergeMultipleActions([
      { action: 'clock_in', entry: { locationName: 'Obra A', locationId: 'a' } },
      { action: 'lunch_start', entry: { locationName: 'Obra A', locationId: 'a' } },
      { action: 'lunch_end', entry: { locationName: 'Obra B', locationId: 'b' } },
      { action: 'clock_out', entry: { locationName: 'Obra B', locationId: 'b' } },
    ]);

    expect(Object.keys(merged)).toHaveLength(4);
    expect(merged.lunch_end?.locationId).toBe('b');
  });
});

describe('filterAllowedLocationsByRestrictions', () => {
  const all = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
  ] as any[];

  it('sem restrições devolve todas as obras', () => {
    expect(filterAllowedLocationsByRestrictions(all, [])).toHaveLength(3);
  });

  it('com restrições filtra para a lista do funcionário', () => {
    const filtered = filterAllowedLocationsByRestrictions(all, ['1', '2']);
    expect(filtered.map((l) => l.id)).toEqual(['1', '2']);
  });
});
