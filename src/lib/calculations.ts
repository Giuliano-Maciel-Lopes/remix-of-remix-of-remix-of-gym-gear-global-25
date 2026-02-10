/**
 * Calculation utilities for the Gym Equipment Trading System
 * All formulas for FOB, CIF, landed costs, and container estimation
 */

// =============================================================================
// CONSTANTS — SINGLE SOURCE OF TRUTH
// =============================================================================

export type ContainerType = '20FT' | '40FT' | '40HC';
export type DestinationCountry = 'US' | 'AR' | 'BR';

// Container capacities in CBM
export const CONTAINER_CBM: Record<ContainerType, number> = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
};

// Tax/duty rates by destination
export const DUTY_RATES: Record<DestinationCountry, { standard: number; simplified?: number }> = {
  US: { standard: 0.301 },
  AR: { standard: 0.8081, simplified: 0.51 },
  BR: { standard: 0.668 },
};

// =============================================================================
// CANONICAL COST CALCULATION — USE THIS EVERYWHERE
// =============================================================================

export interface CostCalculationInput {
  totalFob: number;
  totalCbm: number;
  totalWeight: number;
  containerType: ContainerType;
  containerQtyOverride?: number | null;
  freightPerContainer: number;
  insuranceRate: number;
  fixedCosts: number;
}

export interface CostCalculationResult {
  totalFob: number;
  totalCbm: number;
  totalWeight: number;
  containerQty: number;
  freightTotal: number;
  insuranceTotal: number;
  cifTotal: number;
  landedUS: number;
  landedARStandard: number;
  landedARSimplified: number;
  landedBR: number;
}

/**
 * CANONICAL cost calculation function.
 * ALL FOB → CIF → Landed calculations MUST go through this function.
 * It is FORBIDDEN to duplicate these formulas anywhere else.
 */
export function calculateCosts(input: CostCalculationInput): CostCalculationResult {
  const containerCapacity = CONTAINER_CBM[input.containerType];
  const calculatedContainers = Math.ceil(input.totalCbm / containerCapacity);
  const containerQty = input.containerQtyOverride ?? (calculatedContainers > 0 ? calculatedContainers : 1);

  const freightTotal = containerQty * input.freightPerContainer;
  const insuranceTotal = (input.totalFob + freightTotal) * input.insuranceRate;
  const cifTotal = input.totalFob + freightTotal + insuranceTotal;

  const landedUS = cifTotal * (1 + DUTY_RATES.US.standard) + input.fixedCosts;
  const landedARStandard = cifTotal * (1 + DUTY_RATES.AR.standard) + input.fixedCosts;
  const landedARSimplified = cifTotal * (1 + (DUTY_RATES.AR.simplified ?? DUTY_RATES.AR.standard)) + input.fixedCosts;
  const landedBR = cifTotal * (1 + DUTY_RATES.BR.standard) + input.fixedCosts;

  return {
    totalFob: input.totalFob,
    totalCbm: input.totalCbm,
    totalWeight: input.totalWeight,
    containerQty,
    freightTotal,
    insuranceTotal,
    cifTotal,
    landedUS,
    landedARStandard,
    landedARSimplified,
    landedBR,
  };
}

// =============================================================================
// UTILITY: Get landed cost for a specific destination from calculation result
// =============================================================================

export function getLandedForDestination(
  calc: CostCalculationResult,
  destination: DestinationCountry,
  simplified: boolean = false
): number {
  switch (destination) {
    case 'US':
      return calc.landedUS;
    case 'AR':
      return simplified ? calc.landedARSimplified : calc.landedARStandard;
    case 'BR':
      return calc.landedBR;
  }
}

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

/**
 * Get container type recommendation based on CBM
 */
export function recommendContainerType(cbm: number): ContainerType {
  if (cbm <= 33) return '20FT';
  if (cbm <= 67) return '40FT';
  return '40HC';
}

/**
 * Calculate container utilization percentage
 */
export function containerUtilization(cbm: number, containerType: ContainerType): number {
  const capacity = CONTAINER_CBM[containerType];
  const containers = Math.ceil(cbm / capacity);
  const totalCapacity = containers * capacity;
  return (cbm / totalCapacity) * 100;
}
