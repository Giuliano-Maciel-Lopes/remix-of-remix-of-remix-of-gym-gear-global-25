/**
 * Generic Supabase Query Hooks
 * Provides reusable hooks for common database operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// =============================================================================
// CLIENTS
// =============================================================================

export interface Client {
  id: string;
  name: string;
  country: string;
  default_currency: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar cliente', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...client }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar cliente', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Cliente excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir cliente', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// SUPPLIERS
// =============================================================================

export interface Supplier {
  id: string;
  name: string;
  country: string;
  default_currency: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  incoterm_default: 'FOB' | 'CIF' | 'EXW' | 'DDP';
  lead_time_days: number;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Fornecedor criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar fornecedor', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...supplier }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Fornecedor atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar fornecedor', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Fornecedor excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir fornecedor', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// CATALOG ITEMS
// =============================================================================

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  category: 'Cardio' | 'Strength' | 'Free Weights' | 'Benches' | 'Accessories' | 'Functional';
  description?: string;
  unit_cbm: number;
  unit_weight_kg: number;
  hs_code?: string;
  ncm_code?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCatalogItems() {
  return useQuery({
    queryKey: ['catalog_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CatalogItem[];
    },
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog_items'] });
      toast({ title: 'Item do catálogo criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar item', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<CatalogItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog_items'] });
      toast({ title: 'Item do catálogo atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar item', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog_items'] });
      toast({ title: 'Item excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir item', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// SKU MAPPING
// =============================================================================

export interface SKUMapping {
  id: string;
  supplier_id: string;
  supplier_model_code: string;
  catalog_item_id: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useSKUMappings() {
  return useQuery({
    queryKey: ['sku_mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sku_mapping')
        .select('*')
        .order('supplier_model_code');
      
      if (error) throw error;
      return data as SKUMapping[];
    },
  });
}

export function useCreateSKUMapping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (mapping: Omit<SKUMapping, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sku_mapping')
        .insert(mapping)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sku_mappings'] });
      toast({ title: 'Mapeamento criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar mapeamento', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSKUMapping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...mapping }: Partial<SKUMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('sku_mapping')
        .update(mapping)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sku_mappings'] });
      toast({ title: 'Mapeamento atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar mapeamento', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSKUMapping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sku_mapping')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sku_mappings'] });
      toast({ title: 'Mapeamento excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir mapeamento', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// SUPPLIER PRICES
// =============================================================================

export interface SupplierPrice {
  id: string;
  supplier_id: string;
  catalog_item_id: string;
  price_fob_usd: number;
  currency_original: 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS';
  price_original: number;
  valid_from: string;
  valid_until?: string;
  moq?: number;
  created_at: string;
  updated_at: string;
}

export function useSupplierPrices() {
  return useQuery({
    queryKey: ['supplier_prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_prices')
        .select('*')
        .order('valid_from', { ascending: false });
      
      if (error) throw error;
      return data as SupplierPrice[];
    },
  });
}

export function useCreateSupplierPrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (price: Omit<SupplierPrice, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('supplier_prices')
        .insert(price)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_prices'] });
      toast({ title: 'Preço adicionado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar preço', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSupplierPrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...price }: Partial<SupplierPrice> & { id: string }) => {
      const { data, error } = await supabase
        .from('supplier_prices')
        .update(price)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_prices'] });
      toast({ title: 'Preço atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar preço', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSupplierPrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('supplier_prices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_prices'] });
      toast({ title: 'Preço excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir preço', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Cotação excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir cotação', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// QUOTES
// =============================================================================

export interface Quote {
  id: string;
  name: string;
  client_id?: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'cancelled';
  destination_country: 'US' | 'AR' | 'BR';
  container_type: '20FT' | '40FT' | '40HC';
  container_qty_override?: number;
  freight_per_container_usd: number;
  insurance_rate: number;
  fixed_costs_usd: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteLine {
  id: string;
  quote_id: string;
  catalog_item_id: string;
  qty: number;
  chosen_supplier_id: string;
  override_price_fob_usd?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Quote[];
    },
  });
}

export function useQuoteWithLines(quoteId: string) {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      const [quoteRes, linesRes] = await Promise.all([
        supabase.from('quotes').select('*').eq('id', quoteId).single(),
        supabase.from('quote_lines').select('*').eq('quote_id', quoteId),
      ]);
      
      if (quoteRes.error) throw quoteRes.error;
      if (linesRes.error) throw linesRes.error;
      
      return {
        quote: quoteRes.data as Quote,
        lines: linesRes.data as QuoteLine[],
      };
    },
    enabled: !!quoteId,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert(quote)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Cotação criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar cotação', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...quote }: Partial<Quote> & { id: string }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(quote)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] });
      toast({ title: 'Cotação atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar cotação', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateQuoteLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (line: Omit<QuoteLine, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('quote_lines')
        .insert(line)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote', data.quote_id] });
    },
  });
}

export function useDeleteQuoteLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quoteId }: { id: string; quoteId: string }) => {
      const { error } = await supabase
        .from('quote_lines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, quoteId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote', data.quoteId] });
    },
  });
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const [clientsRes, suppliersRes, catalogRes, quotesRes, mappingsRes, pricesRes] = await Promise.all([
        supabase.from('clients').select('id, is_active'),
        supabase.from('suppliers').select('id, is_active, lead_time_days'),
        supabase.from('catalog_items').select('id, is_active'),
        supabase.from('quotes').select('id, status'),
        supabase.from('sku_mapping').select('id, catalog_item_id'),
        supabase.from('supplier_prices').select('id, price_fob_usd'),
      ]);

      const activeSuppliers = suppliersRes.data?.filter(s => s.is_active) || [];
      const avgLeadTime = activeSuppliers.length > 0
        ? Math.round(activeSuppliers.reduce((sum, s) => sum + s.lead_time_days, 0) / activeSuppliers.length)
        : 0;

      return {
        totalClients: clientsRes.data?.length || 0,
        activeClients: clientsRes.data?.filter(c => c.is_active).length || 0,
        totalSuppliers: suppliersRes.data?.length || 0,
        activeSuppliers: activeSuppliers.length,
        catalogItems: catalogRes.data?.filter(c => c.is_active).length || 0,
        totalQuotes: quotesRes.data?.length || 0,
        pendingQuotes: quotesRes.data?.filter(q => q.status === 'pending').length || 0,
        draftQuotes: quotesRes.data?.filter(q => q.status === 'draft').length || 0,
        pendingMappings: mappingsRes.data?.filter(m => !m.catalog_item_id).length || 0,
        avgLeadTime,
        totalFOB: pricesRes.data?.reduce((sum, p) => sum + Number(p.price_fob_usd), 0) || 0,
      };
    },
  });
}
