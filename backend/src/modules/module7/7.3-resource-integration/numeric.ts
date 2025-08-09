/**
 * Numeric utilities for stable floating-point comparisons
 * Provides consistent EPS tolerance across Module 7.3
 */

import { CAP_MARGIN, EPS } from "../config";

export { CAP_MARGIN, EPS };

export const nearlyLTE = (a: number, b: number): boolean => a <= b + EPS;
export const nearlyGTE = (a: number, b: number): boolean => a + EPS >= b;
export const nearlyEqual = (a: number, b: number): boolean =>
  Math.abs(a - b) <= EPS;

// Capacity-aware comparison with margin
export const withinCapacity = (
  used: number,
  duration: number,
  capacity: number,
): boolean => {
  return nearlyLTE(used + duration, capacity * (1 - CAP_MARGIN));
};

// Load ratio calculation with safety
export const calculateLoadRatio = (
  assigned: number,
  capacity: number,
): number => {
  return capacity > EPS ? assigned / capacity : 0;
};

// Normalized variance calculation
export const calculateNormalizedVariance = (loadRatios: number[]): number => {
  if (loadRatios.length === 0) return 0;

  const mean =
    loadRatios.reduce((sum, ratio) => sum + ratio, 0) / loadRatios.length;
  const squaredDeviations = loadRatios.map((ratio) =>
    Math.pow(ratio - mean, 2),
  );
  return (
    squaredDeviations.reduce((sum, dev) => sum + dev, 0) / loadRatios.length
  );
};
