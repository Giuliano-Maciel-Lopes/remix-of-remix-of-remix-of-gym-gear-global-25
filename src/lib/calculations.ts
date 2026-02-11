/**
 * Calculation utilities - FORMATTING ONLY
 * All financial/logistical calculations are done by the backend.
 * This file contains only display formatters.
 */

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Calculate percentage difference from reference value
 */
export function percentDifference(value: number, reference: number): number {
  if (reference === 0) return 0;
  return ((value - reference) / reference) * 100;
}
