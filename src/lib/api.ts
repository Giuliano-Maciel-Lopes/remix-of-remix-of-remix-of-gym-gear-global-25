/**
 * API Client for GymTrade Backend
 * Handles all HTTP requests to the external backend API
 */

// API Base URL - configure this for your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `HTTP Error: ${response.status}`);
    (error as any).status = response.status;
    (error as any).details = errorData.details;
    throw error;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// =============================================================================
// AUTH API
// =============================================================================

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
  token: string;
}

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () =>
    request<{ id: string; email: string; role: string; createdAt: string }>('/auth/profile'),
};

// =============================================================================
// CLIENTS API
// =============================================================================

export interface Client {
  id: string;
  name: string;
  country: string;
  default_currency: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const clientsApi = {
  getAll: (includeInactive = false) =>
    request<Client[]>(`/clients?includeInactive=${includeInactive}`),

  getById: (id: string) =>
    request<Client>(`/clients/${id}`),

  create: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) =>
    request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Client>) =>
    request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string, soft = true) =>
    request<void>(`/clients/${id}?soft=${soft}`, {
      method: 'DELETE',
    }),
};

// =============================================================================
// SUPPLIERS API
// =============================================================================

export interface Supplier {
  id: string;
  name: string;
  country: string;
  default_currency: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  incoterm_default: 'FOB' | 'CIF' | 'EXW' | 'DDP';
  lead_time_days: number;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const suppliersApi = {
  getAll: (includeInactive = false) =>
    request<Supplier[]>(`/suppliers?includeInactive=${includeInactive}`),

  getById: (id: string) =>
    request<Supplier>(`/suppliers/${id}`),

  create: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) =>
    request<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Supplier>) =>
    request<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string, soft = true) =>
    request<void>(`/suppliers/${id}?soft=${soft}`, {
      method: 'DELETE',
    }),
};

// =============================================================================
// CATALOG API
// =============================================================================

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  category: 'Cardio' | 'Strength' | 'Free Weights' | 'Benches' | 'Accessories' | 'Functional';
  description?: string | null;
  unit_cbm: number;
  unit_weight_kg: number;
  hs_code?: string | null;
  ncm_code?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const catalogApi = {
  getAll: (includeInactive = false) =>
    request<CatalogItem[]>(`/catalog?includeInactive=${includeInactive}`),

  getById: (id: string) =>
    request<CatalogItem>(`/catalog/${id}`),

  create: (data: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>) =>
    request<CatalogItem>('/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CatalogItem>) =>
    request<CatalogItem>(`/catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string, soft = true) =>
    request<void>(`/catalog/${id}?soft=${soft}`, {
      method: 'DELETE',
    }),
};

// =============================================================================
// SKU MAPPING API
// =============================================================================

export interface SKUMapping {
  id: string;
  supplier_id: string;
  supplier_model_code: string;
  catalog_item_id: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export const skuMappingApi = {
  getAll: () =>
    request<SKUMapping[]>('/sku-mapping'),

  getById: (id: string) =>
    request<SKUMapping>(`/sku-mapping/${id}`),

  create: (data: Omit<SKUMapping, 'id' | 'created_at' | 'updated_at'>) =>
    request<SKUMapping>('/sku-mapping', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<SKUMapping>) =>
    request<SKUMapping>(`/sku-mapping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/sku-mapping/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================================================
// SUPPLIER PRICES API
// =============================================================================

export interface SupplierPrice {
  id: string;
  supplier_id: string;
  catalog_item_id: string;
  price_fob_usd: number;
  currency_original: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  price_original: number;
  valid_from: string;
  valid_until?: string | null;
  moq?: number | null;
  created_at: string;
  updated_at: string;
}

export const supplierPricesApi = {
  getAll: () =>
    request<SupplierPrice[]>('/supplier-prices'),

  getById: (id: string) =>
    request<SupplierPrice>(`/supplier-prices/${id}`),

  create: (data: Omit<SupplierPrice, 'id' | 'created_at' | 'updated_at'>) =>
    request<SupplierPrice>('/supplier-prices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<SupplierPrice>) =>
    request<SupplierPrice>(`/supplier-prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/supplier-prices/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================================================
// QUOTES API
// =============================================================================

export interface QuoteLine {
  id?: string;
  catalog_item_id: string;
  catalog_item?: { id: string; sku: string; name: string; unit_cbm: number; unit_weight_kg: number } | null;
  chosen_supplier_id: string;
  supplier?: { id: string; name: string } | null;
  qty: number;
  override_price_fob_usd?: number | null;
  notes?: string | null;
}

export interface QuoteCalculations {
  total_fob: number;
  total_cbm: number;
  total_weight: number;
  container_qty: number;
  freight_total: number;
  insurance_total: number;
  cif_total: number;
  landed_us: number;
  landed_ar_standard: number;
  landed_ar_simplified: number;
  landed_br: number;
  lines: Array<{
    catalog_item_id: string;
    catalog_item_name: string;
    supplier_id: string;
    supplier_name: string;
    qty: number;
    price_fob_usd: number;
    fob_total: number;
    cbm_total: number;
    weight_total: number;
  }>;
}

export interface Quote {
  id: string;
  name: string;
  client_id?: string | null;
  client?: { id: string; name: string } | null;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'cancelled';
  destination_country: 'US' | 'AR' | 'BR';
  container_type: '20FT' | '40FT' | '40HC';
  container_qty_override?: number | null;
  freight_per_container_usd: number;
  insurance_rate: number;
  fixed_costs_usd: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  lines: QuoteLine[];
  calculations?: QuoteCalculations;
}

export interface CompareInput {
  catalog_item_id: string;
  qty: number;
  container_type: string;
  freight_per_container_usd: number;
  insurance_rate: number;
  fixed_costs_usd: number;
}

export interface CompareResult {
  supplier_id: string;
  supplier_name: string;
  supplier_country: string;
  lead_time_days: number;
  price_fob_usd: number;
  fob_total: number;
  cbm_total: number;
  weight_total: number;
  freight_total: number;
  insurance_total: number;
  cif_total: number;
  landed_us: number;
  landed_ar_standard: number;
  landed_ar_simplified: number;
  landed_br: number;
  container_qty: number;
  is_best_fob: boolean;
}

export interface KitInput {
  store_size: 'small' | 'medium' | 'large';
  budget_usd: number;
}

export interface KitItem {
  catalog_item_id: string;
  catalog_item_name: string;
  catalog_item_sku: string;
  category: string;
  qty: number;
  supplier_id: string;
  supplier_name: string;
  price_fob_usd: number;
  fob_total: number;
}

export interface KitResult {
  store_size: string;
  budget_usd: number;
  total_fob: number;
  budget_remaining: number;
  items: KitItem[];
}

export const quotesApi = {
  getAll: () =>
    request<Quote[]>('/quotes'),

  getById: (id: string) =>
    request<Quote>(`/quotes/${id}`),

  create: (data: Partial<Quote>) =>
    request<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Quote>) =>
    request<Quote>(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/quotes/${id}`, {
      method: 'DELETE',
    }),

  addLine: (quoteId: string, line: Omit<QuoteLine, 'id'>) =>
    request<Quote>(`/quotes/${quoteId}/lines`, {
      method: 'POST',
      body: JSON.stringify(line),
    }),

  updateLine: (quoteId: string, lineId: string, line: Partial<QuoteLine>) =>
    request<Quote>(`/quotes/${quoteId}/lines/${lineId}`, {
      method: 'PUT',
      body: JSON.stringify(line),
    }),

  deleteLine: (quoteId: string, lineId: string) =>
    request<Quote>(`/quotes/${quoteId}/lines/${lineId}`, {
      method: 'DELETE',
    }),

  compare: (input: CompareInput) =>
    request<CompareResult[]>('/quotes/compare', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

// =============================================================================
// KITS API
// =============================================================================

export const kitsApi = {
  generate: (input: KitInput) =>
    request<KitResult>('/kits/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
