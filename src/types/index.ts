/**
 * Type definitions for the Gym Equipment Trading System
 * All data structures for suppliers, catalog, orders, and calculations
 */

// =============================================================================
// SUPPLIER TYPES
// =============================================================================

export interface Supplier {
  id: string;
  name: string;
  country: string;
  default_currency: 'USD' | 'CNY' | 'EUR';
  incoterm_default: 'FOB' | 'CIF' | 'EXW' | 'DDP';
  lead_time_days: number;
  is_active: boolean;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

// =============================================================================
// CATALOG TYPES
// =============================================================================

export type EquipmentCategory = 
  | 'Cardio' 
  | 'Strength' 
  | 'Free Weights' 
  | 'Benches' 
  | 'Accessories'
  | 'Functional';

export interface CatalogItem {
  id: string;
  sku: string;
  category: EquipmentCategory;
  name: string;
  description: string;
  unit_cbm: number;       // Cubic meters per unit
  unit_weight_kg: number; // Weight in kilograms
  hs_code: string;        // Harmonized System code for customs
  ncm_code: string;       // Brazilian NCM code
  is_active: boolean;
  image_url?: string;
}

// =============================================================================
// SKU MAPPING TYPES
// Maps supplier's product codes to our internal catalog items
// =============================================================================

export interface SKUMapping {
  id: string;
  supplier_id: string;
  supplier_model_code: string;  // Supplier's own product code
  catalog_item_id: string | null;     // Our internal catalog item (null = pending)
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PRICING TYPES
// =============================================================================

export interface SupplierPrice {
  id: string;
  supplier_id: string;
  catalog_item_id: string;
  price_fob_usd: number;           // FOB price in USD
  currency_original: 'USD' | 'CNY' | 'EUR';
  price_original: number;          // Original price in supplier's currency
  valid_from: string;              // ISO date string
  valid_until?: string;            // Optional expiration
  moq?: number;                    // Minimum order quantity
}

// =============================================================================
// QUOTE/ORDER TYPES
// =============================================================================

export type DestinationCountry = 'US' | 'AR' | 'BR';
export type ContainerType = '20FT' | '40FT' | '40HC';

// Capacity in CBM for each container type
export const CONTAINER_CAPACITY: Record<ContainerType, number> = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
};

export interface QuoteLine {
  id: string;
  quote_id: string;
  catalog_item_id: string;
  qty: number;
  chosen_supplier_id: string;
  override_price_fob_usd?: number;  // Optional price override
  notes?: string;
}

export interface Quote {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'cancelled';
  destination_country: DestinationCountry;
  container_type: ContainerType;
  container_qty_override?: number;  // Manual override for container count
  freight_per_container_usd: number;
  insurance_rate: number;           // As decimal (e.g., 0.005 = 0.5%)
  fixed_costs_usd: number;          // Port fees, documentation, etc.
  lines: QuoteLine[];
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CALCULATION TYPES
// =============================================================================

// Tax/duty rates by destination country
export const LANDED_RATES: Record<DestinationCountry, { standard: number; simplified?: number }> = {
  US: { standard: 0.301 },              // ~30.1% duties and fees
  AR: { standard: 0.8081, simplified: 0.51 }, // Argentina has simplified regime
  BR: { standard: 0.668 },              // Brazil ~66.8%
};

export interface LineCalculation {
  catalog_item: CatalogItem;
  supplier: Supplier;
  qty: number;
  price_fob_usd: number;
  
  // Calculated values
  fob_total: number;
  cbm_total: number;
  weight_total: number;
}

export interface QuoteCalculation {
  quote: Quote;
  lines: LineCalculation[];
  
  // Totals
  total_fob: number;
  total_cbm: number;
  total_weight: number;
  container_qty: number;
  
  // Freight and insurance
  freight_total: number;
  insurance_total: number;
  cif_total: number;
  
  // Landed costs by destination
  landed_us: number;
  landed_ar_standard: number;
  landed_ar_simplified: number;
  landed_br: number;
}

// =============================================================================
// COMPARISON TYPES
// Used for supplier comparison views
// =============================================================================

export interface SupplierComparison {
  catalog_item_id: string;
  catalog_item: CatalogItem;
  suppliers: {
    supplier: Supplier;
    price_fob_usd: number;
    is_best_price: boolean;
    price_difference_pct: number;  // Compared to best price
    lead_time_days: number;
  }[];
}

export interface QuoteComparison {
  quote_id: string;
  name: string;
  destination: DestinationCountry;
  fob_total: number;
  landed_total: number;
  avg_lead_time: number;
  container_qty: number;
  is_best_fob: boolean;
  is_best_landed: boolean;
  is_fastest: boolean;
}

// =============================================================================
// UI/DASHBOARD TYPES
// =============================================================================

export interface DashboardStats {
  total_quotes: number;
  active_suppliers: number;
  catalog_items: number;
  pending_mappings: number;
  total_fob_value: number;
  avg_lead_time: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  link?: string;
}
