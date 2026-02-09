/**
 * API Query Hooks for GymTrade Pro
 * Uses the backend API (Express + Prisma)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  clientsApi,
  suppliersApi,
  catalogApi,
  skuMappingApi,
  supplierPricesApi,
  quotesApi,
  Client,
  Supplier,
  CatalogItem,
  SKUMapping,
  SupplierPrice,
  Quote,
  QuoteLine,
} from '@/lib/api';

// Re-export types for convenience
export type { Client, Supplier, CatalogItem, SKUMapping, SupplierPrice, Quote, QuoteLine };

// =============================================================================
// CLIENTS
// =============================================================================

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) =>
      clientsApi.create(client),
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
    mutationFn: ({ id, ...client }: Partial<Client> & { id: string }) =>
      clientsApi.update(id, client),
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
    mutationFn: (id: string) => clientsApi.delete(id),
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

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getAll(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) =>
      suppliersApi.create(supplier),
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
    mutationFn: ({ id, ...supplier }: Partial<Supplier> & { id: string }) =>
      suppliersApi.update(id, supplier),
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
    mutationFn: (id: string) => suppliersApi.delete(id),
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

export function useCatalogItems() {
  return useQuery({
    queryKey: ['catalog_items'],
    queryFn: () => catalogApi.getAll(),
  });
}

export function useCatalogItem(id: string) {
  return useQuery({
    queryKey: ['catalog_items', id],
    queryFn: () => catalogApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (item: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>) =>
      catalogApi.create(item),
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
    mutationFn: ({ id, ...item }: Partial<CatalogItem> & { id: string }) =>
      catalogApi.update(id, item),
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
    mutationFn: (id: string) => catalogApi.delete(id),
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

export function useSKUMappings() {
  return useQuery({
    queryKey: ['sku_mappings'],
    queryFn: () => skuMappingApi.getAll(),
  });
}

export function useCreateSKUMapping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (mapping: Omit<SKUMapping, 'id' | 'created_at' | 'updated_at'>) =>
      skuMappingApi.create(mapping),
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
    mutationFn: ({ id, ...mapping }: Partial<SKUMapping> & { id: string }) =>
      skuMappingApi.update(id, mapping),
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
    mutationFn: (id: string) => skuMappingApi.delete(id),
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

export function useSupplierPrices() {
  return useQuery({
    queryKey: ['supplier_prices'],
    queryFn: () => supplierPricesApi.getAll(),
  });
}

export function useCreateSupplierPrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (price: Omit<SupplierPrice, 'id' | 'created_at' | 'updated_at'>) =>
      supplierPricesApi.create(price),
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
    mutationFn: ({ id, ...price }: Partial<SupplierPrice> & { id: string }) =>
      supplierPricesApi.update(id, price),
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
    mutationFn: (id: string) => supplierPricesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_prices'] });
      toast({ title: 'Preço excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir preço', description: error.message, variant: 'destructive' });
    },
  });
}

// =============================================================================
// QUOTES
// =============================================================================

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll(),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quotesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (quote: Partial<Quote>) => quotesApi.create(quote),
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
    mutationFn: ({ id, ...quote }: Partial<Quote> & { id: string }) =>
      quotesApi.update(id, quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Cotação atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar cotação', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Cotação excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir cotação', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddQuoteLine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ quoteId, line }: { quoteId: string; line: Omit<QuoteLine, 'id'> }) =>
      quotesApi.addLine(quoteId, line),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Linha adicionada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar linha', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuoteLine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ quoteId, lineId, line }: { quoteId: string; lineId: string; line: Partial<QuoteLine> }) =>
      quotesApi.updateLine(quoteId, lineId, line),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Linha atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar linha', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuoteLine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ quoteId, lineId }: { quoteId: string; lineId: string }) =>
      quotesApi.deleteLine(quoteId, lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Linha excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir linha', description: error.message, variant: 'destructive' });
    },
  });
}

// Aliases for backward compatibility
export const useQuoteWithLines = useQuote;
export const useCreateQuoteLine = useAddQuoteLine;

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export function useDashboardStats() {
  const { data: quotes } = useQuotes();
  const { data: suppliers } = useSuppliers();
  const { data: catalogItems } = useCatalogItems();
  const { data: clients } = useClients();

  const stats = {
    totalQuotes: quotes?.length || 0,
    pendingQuotes: quotes?.filter(q => q.status === 'pending').length || 0,
    draftQuotes: quotes?.filter(q => q.status === 'draft').length || 0,
    approvedQuotes: quotes?.filter(q => q.status === 'approved').length || 0,
    activeSuppliers: suppliers?.filter(s => s.is_active).length || 0,
    totalSuppliers: suppliers?.length || 0,
    catalogItems: catalogItems?.length || 0,
    activeClients: clients?.filter(c => c.is_active).length || 0,
    totalClients: clients?.length || 0,
    avgLeadTime: suppliers?.length 
      ? Math.round(suppliers.reduce((sum, s) => sum + (s.lead_time_days || 0), 0) / suppliers.length)
      : 0,
  };

  const isLoading = !quotes && !suppliers && !catalogItems && !clients;

  return { data: isLoading ? undefined : stats, isLoading };
}
