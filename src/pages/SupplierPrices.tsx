/**
 * Supplier Prices Page
 * CRUD operations for supplier prices
 */

import React, { useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, TrendingDown, TrendingUp, Building2, Package, Download, Upload } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormError } from '@/components/common/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useSupplierPrices,
  useSuppliers,
  useCatalogItems,
  useCreateSupplierPrice,
  useUpdateSupplierPrice,
  useDeleteSupplierPrice,
  SupplierPrice
} from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel, formatDateBR, formatMoney } from '@/lib/exportExcel';
import { supplierPriceSchema, validateForm, ValidationErrors } from '@/lib/validationSchemas';
import { ImportExcelButton } from '@/components/common/ImportExcelButton';

const currencies = ['USD', 'CNY', 'EUR', 'BRL', 'ARS'] as const;

export default function SupplierPricesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState<SupplierPrice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierPrice | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterItem, setFilterItem] = useState<string>('all');
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    catalog_item_id: '',
    price_fob_usd: 0,
    currency_original: 'USD' as SupplierPrice['currency_original'],
    price_original: 0,
    valid_from: new Date().toISOString().split('T')[0],
    moq: 1,
  });

  const { data: prices, isLoading: loadingPrices } = useSupplierPrices();
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { data: catalogItems, isLoading: loadingCatalog } = useCatalogItems();
  const createPrice = useCreateSupplierPrice();
  const updatePrice = useUpdateSupplierPrice();
  const deletePrice = useDeleteSupplierPrice();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const isLoading = loadingPrices || loadingSuppliers || loadingCatalog;

  // Get supplier by id
  const getSupplierById = (id: string) => suppliers?.find(s => s.id === id);
  
  // Get catalog item by id
  const getCatalogItemById = (id: string) => catalogItems?.find(c => c.id === id);

  // Filter prices
  const filteredPrices = prices?.filter(p => {
    const matchesSupplier = filterSupplier === 'all' || p.supplier_id === filterSupplier;
    const matchesItem = filterItem === 'all' || p.catalog_item_id === filterItem;
    return matchesSupplier && matchesItem;
  });

  // Get lowest price for an item
  const getLowestPrice = (catalogItemId: string): number => {
    const itemPrices = prices?.filter(p => p.catalog_item_id === catalogItemId) || [];
    if (itemPrices.length === 0) return 0;
    return Math.min(...itemPrices.map(p => Number(p.price_fob_usd)));
  };

  // Open dialog for new price
  const handleNew = () => {
    setEditingPrice(null);
    setFormErrors({});
    setFormData({
      supplier_id: '',
      catalog_item_id: '',
      price_fob_usd: 0,
      currency_original: 'USD',
      price_original: 0,
      valid_from: new Date().toISOString().split('T')[0],
      moq: 1,
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (price: SupplierPrice) => {
    setEditingPrice(price);
    setFormErrors({});
    setFormData({
      supplier_id: price.supplier_id,
      catalog_item_id: price.catalog_item_id,
      price_fob_usd: Number(price.price_fob_usd),
      currency_original: price.currency_original,
      price_original: Number(price.price_original),
      valid_from: price.valid_from.split('T')[0],
      moq: price.moq || 1,
    });
    setShowDialog(true);
  };

  // Delete price permanently
  const handleDelete = async () => {
    if (deleteTarget) {
      await deletePrice.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Save price with validation
  const handleSave = async () => {
    const { success, errors } = validateForm(supplierPriceSchema, formData);
    if (!success) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    
    // Convert date to ISO datetime for backend
    const payload = {
      ...formData,
      valid_from: formData.valid_from
        ? new Date(formData.valid_from + 'T00:00:00.000Z').toISOString()
        : new Date().toISOString(),
    };

    try {
      if (editingPrice) {
        await updatePrice.mutateAsync({
          id: editingPrice.id,
          ...payload,
        });
      } else {
        await createPrice.mutateAsync(payload);
      }
      setShowDialog(false);
    } catch (e) {
      // Error toast is handled by the mutation hooks
    }
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredPrices?.length) return;
    exportToExcel(filteredPrices, [
      { header: 'Item', accessor: (p) => getCatalogItemById(p.catalog_item_id)?.name || '-' },
      { header: 'SKU', accessor: (p) => getCatalogItemById(p.catalog_item_id)?.sku || '-' },
      { header: 'Fornecedor', accessor: (p) => getSupplierById(p.supplier_id)?.name || '-' },
      { header: 'Preço FOB (USD)', accessor: (p) => Number(p.price_fob_usd) },
      { header: 'Moeda Original', accessor: (p) => p.currency_original },
      { header: 'Preço Original', accessor: (p) => Number(p.price_original) },
      { header: 'MOQ', accessor: (p) => p.moq || 1 },
      { header: 'Válido Desde', accessor: (p) => formatDateBR(p.valid_from) },
    ], 'precos-fornecedores');
  };

  // Table columns
  const columns: Column<SupplierPrice>[] = [
    {
      key: 'item',
      header: 'Item do Catálogo',
      accessor: (price) => {
        const item = getCatalogItemById(price.catalog_item_id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{item?.name ?? 'Desconhecido'}</p>
              <p className="text-xs text-muted-foreground font-mono">{item?.sku}</p>
            </div>
          </div>
        );
      },
      sortable: true,
      sortValue: (price) => getCatalogItemById(price.catalog_item_id)?.name ?? '',
    },
    {
      key: 'supplier',
      header: 'Fornecedor',
      accessor: (price) => {
        const supplier = getSupplierById(price.supplier_id);
        return (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{supplier?.name ?? 'Desconhecido'}</span>
          </div>
        );
      },
      sortable: true,
      sortValue: (price) => getSupplierById(price.supplier_id)?.name ?? '',
    },
    {
      key: 'price_fob',
      header: 'Preço FOB (USD)',
      accessor: (price) => {
        const lowestPrice = getLowestPrice(price.catalog_item_id);
        const isLowest = Number(price.price_fob_usd) === lowestPrice;
        
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLowest ? 'text-success' : ''}`}>
              {formatCurrency(Number(price.price_fob_usd))}
            </span>
            {isLowest && (
              <span className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded">
                Menor
              </span>
            )}
          </div>
        );
      },
      sortable: true,
      sortValue: (price) => Number(price.price_fob_usd),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'price_original',
      header: 'Preço Original',
      accessor: (price) => (
        <div className="text-right">
          <span className="text-sm">
            {formatCurrency(Number(price.price_original), price.currency_original)}
          </span>
          <p className="text-xs text-muted-foreground">{price.currency_original}</p>
        </div>
      ),
      sortable: true,
      sortValue: (price) => Number(price.price_original),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'moq',
      header: 'MOQ',
      accessor: (price) => (
        <span className="text-sm">{price.moq || 1}</span>
      ),
      sortable: true,
      sortValue: (price) => price.moq || 1,
      className: 'text-center',
      headerClassName: 'text-center',
    },
    {
      key: 'valid_from',
      header: 'Válido Desde',
      accessor: (price) => (
        <span className="text-sm text-muted-foreground">
          {new Date(price.valid_from).toLocaleDateString('pt-BR')}
        </span>
      ),
      sortable: true,
      sortValue: (price) => new Date(price.valid_from).getTime(),
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (price) => isAdmin ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(price);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Excluir"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(price);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : null,
      className: 'w-24',
    },
  ];

  // Search function
  const searchFn = (price: SupplierPrice, query: string): boolean => {
    const supplier = getSupplierById(price.supplier_id);
    const item = getCatalogItemById(price.catalog_item_id);
    
    return (
      (supplier?.name.toLowerCase().includes(query) ?? false) ||
      (item?.name.toLowerCase().includes(query) ?? false) ||
      (item?.sku.toLowerCase().includes(query) ?? false)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate stats
  const avgPrice = prices && prices.length > 0
    ? prices.reduce((sum, p) => sum + Number(p.price_fob_usd), 0) / prices.length
    : 0;
  
  const uniqueItems = new Set(prices?.map(p => p.catalog_item_id)).size;
  const uniqueSuppliers = new Set(prices?.map(p => p.supplier_id)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preços de Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie preços FOB por fornecedor e item
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <ImportExcelButton
            endpoint="/import/supplier-prices"
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['supplier_prices'] })}
          />
          {isAdmin && (
            <Button size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Preço
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de Preços</p>
          <p className="text-2xl font-bold">{prices?.length || 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Preço Médio FOB</p>
          <p className="text-2xl font-bold">{formatCurrency(avgPrice)}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Itens com Preço</p>
          <p className="text-2xl font-bold text-success">{uniqueItems}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Fornecedores</p>
          <p className="text-2xl font-bold">{uniqueSuppliers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Fornecedores</SelectItem>
            {suppliers?.filter(s => s.is_active).map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterItem} onValueChange={setFilterItem}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Itens</SelectItem>
            {catalogItems?.filter(c => c.is_active).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filterSupplier !== 'all' || filterItem !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setFilterSupplier('all');
              setFilterItem('all');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Prices table */}
      <DataTable
        data={filteredPrices || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar por fornecedor, item..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        emptyMessage="Nenhum preço encontrado."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? 'Editar Preço' : 'Novo Preço'}
            </DialogTitle>
            <DialogDescription>
              {editingPrice 
                ? 'Atualize as informações do preço.' 
                : 'Adicione um novo preço de fornecedor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Select 
                value={formData.supplier_id}
                onValueChange={(v) => setFormData(f => ({ ...f, supplier_id: v }))}
                disabled={!!editingPrice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.filter(s => s.is_active).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Item do Catálogo *</Label>
              <Select 
                value={formData.catalog_item_id}
                onValueChange={(v) => setFormData(f => ({ ...f, catalog_item_id: v }))}
                disabled={!!editingPrice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems?.filter(c => c.is_active).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.sku}</span>
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço FOB (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price_fob_usd}
                  onChange={(e) => setFormData(f => ({ ...f, price_fob_usd: parseFloat(e.target.value) || 0 }))}
                />
                <FormError error={formErrors.price_fob_usd} />
              </div>

              <div className="space-y-2">
                <Label>MOQ</Label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => setFormData(f => ({ ...f, moq: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moeda Original</Label>
                <Select 
                  value={formData.currency_original}
                  onValueChange={(v) => setFormData(f => ({ ...f, currency_original: v as SupplierPrice['currency_original'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preço Original</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price_original}
                  onChange={(e) => setFormData(f => ({ ...f, price_original: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Válido Desde</Label>
              <Input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData(f => ({ ...f, valid_from: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={
                !formData.supplier_id || 
                !formData.catalog_item_id || 
                formData.price_fob_usd <= 0 ||
                createPrice.isPending || 
                updatePrice.isPending
              }
            >
              {createPrice.isPending || updatePrice.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={`Preço de ${getCatalogItemById(deleteTarget?.catalog_item_id || '')?.name || 'item'}`}
        itemType="Preço"
        onConfirm={handleDelete}
        isLoading={deletePrice.isPending}
        isSoftDelete={false}
      />
    </div>
  );
}
