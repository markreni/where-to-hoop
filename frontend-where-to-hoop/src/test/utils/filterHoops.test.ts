import { describe, it, expect } from 'vitest';
import { helsinkiBounds } from '../../utils/constants';
import type { BasketballHoop } from '../../types/types';

// Helper function that mirrors the filtering logic in App.tsx
const filterHoopsWithinBounds = (hoops: BasketballHoop[]): BasketballHoop[] => {
  const [[swLat, swLng], [neLat, neLng]] = helsinkiBounds as [[number, number], [number, number]];
  return hoops.filter(hoop => {
    const { latitude, longitude } = hoop.coordinates;
    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) return false;
    return latitude >= swLat && latitude <= neLat && longitude >= swLng && longitude <= neLng;
  });
};

// Factory function to create mock hoops with specific coordinates
const createMockHoop = (id: string, latitude: number | null, longitude: number | null): BasketballHoop => ({
  id,
  name: `Test Court ${id}`,
  createdAt: '2024-01-15T10:00:00Z',
  profile_images: [],
  coordinates: { latitude, longitude },
  description: 'Test court description',
  condition: 'good',
  isIndoor: false,
  playerEnrollments: [],
});

describe('Helsinki Bounds Filter', () => {
  // Helsinki greater area bounds from constants.ts:
  // SW corner: [59.9, 24.5] (Kirkkonummi area)
  // NE corner: [60.5, 25.5] (Sipoo/Porvoo area)

  describe('filterHoopsWithinBounds', () => {
    it('includes hoops within Helsinki bounds', () => {
      const hoops = [
        createMockHoop('1', 60.1699, 24.9384), // Helsinki city center
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('excludes hoops north of Helsinki bounds', () => {
      const hoops = [
        createMockHoop('1', 61.0, 24.9384), // North of bounds (lat > 60.5)
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes hoops south of Helsinki bounds', () => {
      const hoops = [
        createMockHoop('1', 59.5, 24.9384), // South of bounds (lat < 59.9)
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes hoops west of Helsinki bounds', () => {
      const hoops = [
        createMockHoop('1', 60.1699, 24.0), // West of bounds (lng < 24.5)
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes hoops east of Helsinki bounds', () => {
      const hoops = [
        createMockHoop('1', 60.1699, 26.0), // East of bounds (lng > 25.5)
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('includes hoops exactly on SW corner boundary', () => {
      const hoops = [
        createMockHoop('1', 59.9, 24.5), // Exactly on SW corner
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(1);
    });

    it('includes hoops exactly on NE corner boundary', () => {
      const hoops = [
        createMockHoop('1', 60.5, 25.5), // Exactly on NE corner
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(1);
    });

    it('filters mixed hoops correctly', () => {
      const hoops = [
        createMockHoop('inside-1', 60.1699, 24.9384), // Helsinki center - inside
        createMockHoop('inside-2', 60.3, 25.0), // Vantaa area - inside
        createMockHoop('outside-1', 61.5, 23.8), // Tampere area - outside
        createMockHoop('outside-2', 60.45, 22.27), // Turku area - outside
        createMockHoop('inside-3', 60.2, 24.75), // Espoo area - inside
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(3);
      expect(result.map(h => h.id)).toEqual(['inside-1', 'inside-2', 'inside-3']);
    });

    it('excludes hoops with null latitude', () => {
      const hoops = [
        createMockHoop('1', null, 24.9384),
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes hoops with null longitude', () => {
      const hoops = [
        createMockHoop('1', 60.1699, null),
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes hoops with both null coordinates', () => {
      const hoops = [
        createMockHoop('1', null, null),
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('returns empty array for empty input', () => {
      const result = filterHoopsWithinBounds([]);
      expect(result).toHaveLength(0);
    });

    it('preserves hoop data when filtering', () => {
      const hoops = [
        {
          ...createMockHoop('1', 60.1699, 24.9384),
          name: 'Special Court',
          description: 'A very special court',
          condition: 'excellent' as const,
          isIndoor: true,
        },
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result[0]).toEqual(hoops[0]);
    });
  });

  describe('boundary edge cases', () => {
    it('includes Porvoo area (NE boundary)', () => {
      const hoops = [
        createMockHoop('1', 60.4, 25.4), // Porvoo area
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(1);
    });

    it('includes Kirkkonummi area (SW boundary)', () => {
      const hoops = [
        createMockHoop('1', 60.0, 24.6), // Kirkkonummi area
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(1);
    });

    it('excludes Lahti (too far north-east)', () => {
      const hoops = [
        createMockHoop('1', 60.98, 25.66), // Lahti
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });

    it('excludes Hyvinkää (too far north)', () => {
      const hoops = [
        createMockHoop('1', 60.63, 24.86), // Hyvinkää
      ];

      const result = filterHoopsWithinBounds(hoops);
      expect(result).toHaveLength(0);
    });
  });
});
