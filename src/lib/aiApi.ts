/**
 * AI API Client - Read-only analysis endpoints
 * 
 * RULE: AI endpoints NEVER return CIF, Landed, or financial totals.
 * Those values only come from Quotes via calculateQuote.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function aiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/ai${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Types — NO CIF/Landed in kit or plan results
export interface KitLine {
  catalog_item_id: string;
  catalog_item_name: string;
  catalog_item_sku: string;
  category: string;
  supplier_id: string;
  supplier_name: string;
  qty: number;
  price_fob_usd: number;
  fob_total: number;
  unit_cbm: number;
  unit_weight_kg: number;
  cbm_total: number;
  weight_total: number;
}

export interface KitResult {
  profile: string;
  budget_usd: number;
  destination_country: string;
  lines: KitLine[];
  summary: {
    total_items: number;
    total_fob: number;
    total_cbm: number;
    total_weight: number;
    container_type: string;
    container_qty: number;
    budget_utilization: number;
    // NOTE: No CIF or Landed here. Create a Quote for full costs.
  };
}

export interface PriceAnalysisResult {
  message?: string;
  analysis: {
    total_prices: number;
    avg_price: number;
    min_price: number;
    max_price: number;
    std_dev: number;
    cheapest_supplier: { id: string; name: string; avg_price: number } | null;
    suppliers: Array<{
      id: string;
      name: string;
      avg_price: number;
      price_count: number;
      diff_from_avg_pct: number;
    }>;
    outliers: Array<{
      supplier: string;
      item: string;
      price: number;
      deviation_pct: number;
    }>;
    alerts: string[];
  } | null;
}

export interface ScenarioResult {
  quote_name: string;
  base: { fob: number; freight: number; insurance: number; cif: number; landed: number };
  optimistic: { fob: number; freight: number; insurance: number; cif: number; landed: number };
  moderate: { fob: number; freight: number; insurance: number; cif: number; landed: number };
  pessimistic: { fob: number; freight: number; insurance: number; cif: number; landed: number };
  variables: { freight_variation: string; insurance_variation: string; fob_variation: string };
  logistics: { total_cbm: number; total_weight: number; container_type: string; container_qty: number };
}

export interface HsCodeResult {
  product: string;
  category: string;
  suggestions: Array<{ code: string; description: string; confidence: number }>;
}

export interface InsightsResult {
  summary: { totalCatalog: number; totalSuppliers: number; totalPrices: number; totalQuotes: number };
  price_variations: Array<{ catalog_item_id: string; name: string; variation: number; oldest_price: number; newest_price: number }>;
  competitive_suppliers: Array<{ id: string; name: string; avg_price: number; price_count: number }>;
  cheapest_items: Array<{ item: string; supplier: string; price_fob: number }>;
}

export interface ImportPlanResult {
  plan: { destination_country: string; operation_size: string; budget_usd: number };
  lines: Array<KitLine & { supplier_country: string; lead_time_days: number }>;
  summary: KitResult['summary'] & { avg_lead_time_days: number; estimated_delivery_days: number };
}

export const aiApi = {
  generateKit: (data: { profile: string; budget_usd: number; destination_country: string; area_m2?: number }) =>
    aiRequest<KitResult>('/generate-kit', { method: 'POST', body: JSON.stringify(data) }),

  analyzePrices: (data: { catalog_item_id?: string; category?: string }) =>
    aiRequest<PriceAnalysisResult>('/analyze-prices', { method: 'POST', body: JSON.stringify(data) }),

  simulate: (data: { quote_id: string }) =>
    aiRequest<ScenarioResult>('/simulate', { method: 'POST', body: JSON.stringify(data) }),

  suggestHsCode: (data: { name: string; category: string; description?: string }) =>
    aiRequest<HsCodeResult>('/suggest-hs', { method: 'POST', body: JSON.stringify(data) }),

  getInsights: () =>
    aiRequest<InsightsResult>('/insights'),

  planImport: (data: { destination_country: string; budget_usd: number; operation_size: string }) =>
    aiRequest<ImportPlanResult>('/plan-import', { method: 'POST', body: JSON.stringify(data) }),
};
