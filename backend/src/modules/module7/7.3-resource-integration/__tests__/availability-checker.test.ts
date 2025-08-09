/**
 * Module 7.3 - Availability Checker Tests
 */

import { describe, expect, it } from 'vitest';
import {
  getAvailability,
  getMultiDayAvailability,
  getOverallocation,
  getTotalAvailability,
  getUtilization,
  hasAvailability,
  reduceAvailability,
  wouldExceedCapacity,
} from '../availability-checker';
import type { Resource } from '../index';

const mockResource: Resource = {
  id: 'test-resource',
  skills: [{ id: 'test-skill', level: 1 }],
  capacity: 8,
  calendar: {
    '2024-01-15': 6,
    '2024-01-16': 0,
    '2024-01-17': 4,
  },
};

describe('Availability Checker', () => {
  describe('getAvailability', () => {
    it('should return calendar override when available', () => {
      expect(getAvailability(mockResource, '2024-01-15')).toBe(6);
      expect(getAvailability(mockResource, '2024-01-16')).toBe(0);
    });

    it('should return capacity for days not in calendar', () => {
      expect(getAvailability(mockResource, '2024-01-20')).toBe(8);
    });

    it('should never return negative availability', () => {
      const negativeResource = {
        ...mockResource,
        calendar: { '2024-01-15': -2 },
      };
      expect(getAvailability(negativeResource, '2024-01-15')).toBe(0);
    });
  });

  describe('getMultiDayAvailability', () => {
    it('should return availability for multiple days', () => {
      const days = ['2024-01-15', '2024-01-16', '2024-01-20'];
      const result = getMultiDayAvailability(mockResource, days);

      expect(result).toEqual({
        '2024-01-15': 6,
        '2024-01-16': 0,
        '2024-01-20': 8,
      });
    });
  });

  describe('hasAvailability', () => {
    it('should correctly identify availability', () => {
      expect(hasAvailability(mockResource, '2024-01-15')).toBe(true);
      expect(hasAvailability(mockResource, '2024-01-16')).toBe(false);
      expect(hasAvailability(mockResource, '2024-01-20')).toBe(true);
    });
  });

  describe('getTotalAvailability', () => {
    it('should sum availability across days', () => {
      const days = ['2024-01-15', '2024-01-16', '2024-01-17'];
      expect(getTotalAvailability(mockResource, days)).toBe(10); // 6 + 0 + 4
    });
  });

  describe('reduceAvailability', () => {
    it('should create new resource with reduced availability', () => {
      const updated = reduceAvailability(mockResource, '2024-01-15', 3);

      expect(updated.id).toBe(mockResource.id);
      expect(updated.calendar!['2024-01-15']).toBe(3); // 6 - 3
      expect(mockResource.calendar!['2024-01-15']).toBe(6); // Original unchanged
    });

    it('should not go below zero', () => {
      const updated = reduceAvailability(mockResource, '2024-01-15', 10);
      expect(updated.calendar!['2024-01-15']).toBe(0);
    });
  });

  describe('wouldExceedCapacity', () => {
    it('should detect capacity violations', () => {
      expect(wouldExceedCapacity(mockResource, '2024-01-15', 7)).toBe(true); // 7 > 6
      expect(wouldExceedCapacity(mockResource, '2024-01-15', 5)).toBe(false); // 5 <= 6
      expect(wouldExceedCapacity(mockResource, '2024-01-20', 9)).toBe(true); // 9 > 8
    });
  });

  describe('getUtilization', () => {
    it('should calculate utilization percentage', () => {
      expect(getUtilization(mockResource, '2024-01-15', 3)).toBe(37.5); // 3/8 * 100
      expect(getUtilization(mockResource, '2024-01-15', 8)).toBe(100);
      expect(getUtilization(mockResource, '2024-01-15', 12)).toBe(150);
    });

    it('should handle zero capacity', () => {
      const zeroCapResource = { ...mockResource, capacity: 0 };
      expect(getUtilization(zeroCapResource, '2024-01-15', 5)).toBe(0);
    });
  });

  describe('getOverallocation', () => {
    it('should calculate overallocation correctly', () => {
      expect(getOverallocation(mockResource, '2024-01-15', 8)).toBe(
        33.33333333333333
      ); // (8-6)/6 * 100
      expect(getOverallocation(mockResource, '2024-01-15', 6)).toBe(0); // No overallocation
      expect(getOverallocation(mockResource, '2024-01-15', 4)).toBe(0); // Under capacity
    });

    it('should handle zero availability', () => {
      expect(getOverallocation(mockResource, '2024-01-16', 2)).toBe(100); // Any allocation = 100% over
      expect(getOverallocation(mockResource, '2024-01-16', 0)).toBe(0); // No allocation
    });
  });
});
