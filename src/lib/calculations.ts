/**
 * Calculation utilities for the Gym Equipment Trading System
 * All formulas for FOB, CIF, landed costs, and container estimation
 */

import type { 
  Quote, 
  QuoteLine, 
  CatalogItem, 
  Supplier, 
  SupplierPrice,
  LineCalculation,
  QuoteCalculation,
  DestinationCountry,
  ContainerType,
  CONTAINER_CAPACITY,
  LANDED_RATES
} from '@/types';
import { 
  getCatalogItemById, 
  getSupplierById, 
  getSupplierPrice 
} from '@/data/mockData';

// Container capacities in CBM
const CONTAINER_CBM: Record<ContainerType, number> = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
};

// Tax/duty rates by destination
const DUTY_RATES: Record<DestinationCountry, { standard: number; simplified?: number }> = {
  US: { standard: 0.301 },
  AR: { standard: 0.8081, simplified: 0.51 },
  BR: { standard: 0.668 },
};

// =============================================================================
// LINE-LEVEL CALCULATIONS
// =============================================================================

/**
 * Calculate totals for a single quote line
 * FOB = qty × price_fob_usd
 */
export function calculateLine(
  line: QuoteLine,
  catalogItem: CatalogItem,
  supplier: Supplier,
  priceOverride?: number
): LineCalculation {
  const supplierPrice = getSupplierPrice(line.chosen_supplier_id, line.catalog_item_id);
  const price_fob_usd = line.override_price_fob_usd ?? priceOverride ?? supplierPrice?.price_fob_usd ?? 0;
  
  return {
    catalog_item: catalogItem,
    supplier: supplier,
    qty: line.qty,
    price_fob_usd: price_fob_usd,
    fob_total: line.qty * price_fob_usd,
    cbm_total: line.qty * catalogItem.unit_cbm,
    weight_total: line.qty * catalogItem.unit_weight_kg,
  };
}

// =============================================================================
// QUOTE-LEVEL CALCULATIONS
// =============================================================================

/**
 * Calculate all costs for a complete quote
 * 
 * Formulas:
 * - FOB = Σ(qty × price_fob_usd)
 * - FREIGHT = container_qty × freight_per_container_usd
 * - INSURANCE = (FOB + FREIGHT) × insurance_rate
 * - CIF = FOB + FREIGHT + INSURANCE
 * - LANDED_US = CIF × 1.301 + fixed_costs
 * - LANDED_AR_STANDARD = CIF × 1.8081 + fixed_costs (Régimen General)
 * - LANDED_AR_SIMPLIFIED = CIF × 1.51 + fixed_costs (Courier/Simplificado)
 * - LANDED_BR = CIF × 1.668 + fixed_costs
 * - CBM_TOTAL = Σ(qty × unit_cbm)
 * - CONTAINER_QTY = ⌈CBM_TOTAL / container_capacity⌉
 */
export function calculateQuote(quote: Quote): QuoteCalculation {
  // Calculate each line
  const lineCalculations: LineCalculation[] = quote.lines.map(line => {
    const catalogItem = getCatalogItemById(line.catalog_item_id);
    const supplier = getSupplierById(line.chosen_supplier_id);
    
    if (!catalogItem || !supplier) {
      throw new Error(`Missing data for line ${line.id}`);
    }
    
    return calculateLine(line, catalogItem, supplier);
  });
  
  // Sum up line totals
  const total_fob = lineCalculations.reduce((sum, lc) => sum + lc.fob_total, 0);
  const total_cbm = lineCalculations.reduce((sum, lc) => sum + lc.cbm_total, 0);
  const total_weight = lineCalculations.reduce((sum, lc) => sum + lc.weight_total, 0);
  
  // Container calculation
  const containerCapacity = CONTAINER_CBM[quote.container_type];
  const container_qty = quote.container_qty_override ?? Math.ceil(total_cbm / containerCapacity);
  
  // Freight and insurance
  const freight_total = container_qty * quote.freight_per_container_usd;
  const insurance_total = (total_fob + freight_total) * quote.insurance_rate;
  const cif_total = total_fob + freight_total + insurance_total;
  
  // Landed costs by destination
  const usRate = DUTY_RATES.US.standard;
  const arStandardRate = DUTY_RATES.AR.standard;
  const arSimplifiedRate = DUTY_RATES.AR.simplified ?? arStandardRate;
  const brRate = DUTY_RATES.BR.standard;
  
  const landed_us = cif_total * (1 + usRate) + quote.fixed_costs_usd;
  const landed_ar_standard = cif_total * (1 + arStandardRate) + quote.fixed_costs_usd;
  const landed_ar_simplified = cif_total * (1 + arSimplifiedRate) + quote.fixed_costs_usd;
  const landed_br = cif_total * (1 + brRate) + quote.fixed_costs_usd;
  
  return {
    quote,
    lines: lineCalculations,
    total_fob,
    total_cbm,
    total_weight,
    container_qty,
    freight_total,
    insurance_total,
    cif_total,
    landed_us,
    landed_ar_standard,
    landed_ar_simplified,
    landed_br,
  };
}

// =============================================================================
// COMPARISON UTILITIES
// =============================================================================

/**
 * Get the landed cost for a specific destination
 */
export function getLandedForDestination(
  calc: QuoteCalculation, 
  destination: DestinationCountry,
  simplified: boolean = false
): number {
  switch (destination) {
    case 'US':
      return calc.landed_us;
    case 'AR':
      return simplified ? calc.landed_ar_simplified : calc.landed_ar_standard;
    case 'BR':
      return calc.landed_br;
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
