/**
 * SKU Mapping Page
 * Maps supplier product codes to internal catalog items using Supabase
 */

import React, { useState } from 'react';
import { Link2, AlertTriangle, Check, Edit, Plus } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  useSKUMappings, 
  useSuppliers, 
  useCatalogItems,
  useCreateSKUMapping,
  useUpdateSKUMapping,
  SKUMapping
} from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function SKUMappingPage() {
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SKUMapping | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_model_code: '',
    catalog_item_id: '',
    notes: '',
  });

  const { data: skuMappings, isLoading: loadingMappings } = useSKUMappings();
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { data: catalogItems, isLoading: loadingCatalog } = useCatalogItems();
  const createMapping = useCreateSKUMapping();
  const updateMapping = useUpdateSKUMapping();
  const { isAdmin } = useAuth();

  const isLoading = loadingMappings || loadingSuppliers || loadingCatalog;

  // Filter mappings
  const filteredMappings = showPendingOnly
    ? skuMappings?.filter(m => !m.catalog_item_id)
    : skuMappings;

  // Count pending
  const pendingCount = skuMappings?.filter(m => !m.catalog_item_id).length || 0;

  // Get supplier by id
  const getSupplierById = (id: string) => suppliers?.find(s => s.id === id);
  
  // Get catalog item by id
  const getCatalogItemById = (id: string | null) => 
    id ? catalogItems?.find(c => c.id === id) : null;

  // Open dialog for new mapping
  const handleNew = () => {
    setEditingMapping(null);
    setFormData({
      supplier_id: '',
      supplier_model_code: '',
      catalog_item_id: '',
      notes: '',
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (mapping: SKUMapping) => {
    setEditingMapping(mapping);
    setFormData({
      supplier_id: mapping.supplier_id,
      supplier_model_code: mapping.supplier_model_code,
      catalog_item_id: mapping.catalog_item_id || '',
      notes: mapping.notes || '',
    });
    setShowDialog(true);
  };

  // Save mapping
  const handleSave = async () => {
    if (editingMapping) {
      await updateMapping.mutateAsync({
        id: editingMapping.id,
        catalog_item_id: formData.catalog_item_id || null,
        notes: formData.notes || null,
      });
    } else {
      await createMapping.mutateAsync({
        supplier_id: formData.supplier_id,
        supplier_model_code: formData.supplier_model_code,
        catalog_item_id: formData.catalog_item_id || null,
        notes: formData.notes || null,
      });
    }
    setShowDialog(false);
  };

  // Table columns
  const columns: Column<SKUMapping>[] = [
    {
      key: 'status',
      header: '',
      accessor: (mapping) => (
        mapping.catalog_item_id ? (
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-success" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
        )
      ),
      className: 'w-12',
    },
    {
      key: 'supplier',
      header: 'Fornecedor',
      accessor: (mapping) => {
        const supplier = getSupplierById(mapping.supplier_id);
        return (
          <div>
            <p className="font-medium">{supplier?.name ?? 'Desconhecido'}</p>
            <p className="text-xs text-muted-foreground">{supplier?.country}</p>
          </div>
        );
      },
      sortable: true,
      sortValue: (mapping) => getSupplierById(mapping.supplier_id)?.name ?? '',
    },
    {
      key: 'supplier_code',
      header: 'Código do Fornecedor',
      accessor: (mapping) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {mapping.supplier_model_code}
        </span>
      ),
      sortable: true,
      sortValue: (mapping) => mapping.supplier_model_code,
    },
    {
      key: 'catalog_item',
      header: 'Item do Catálogo',
      accessor: (mapping) => {
        if (!mapping.catalog_item_id) {
          return (
            <Badge variant="destructive" className="animate-pulse">
              Pendente
            </Badge>
          );
        }
        const item = getCatalogItemById(mapping.catalog_item_id);
        return (
          <div>
            <p className="font-medium">{item?.name ?? 'Desconhecido'}</p>
            <p className="text-xs text-muted-foreground font-mono">{item?.sku}</p>
          </div>
        );
      },
      sortable: true,
      sortValue: (mapping) => getCatalogItemById(mapping.catalog_item_id)?.name ?? 'zzz',
    },
    {
      key: 'notes',
      header: 'Observações',
      accessor: (mapping) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
          {mapping.notes || '-'}
        </p>
      ),
    },
    {
      key: 'updated',
      header: 'Atualizado',
      accessor: (mapping) => (
        <span className="text-sm text-muted-foreground">
          {new Date(mapping.updated_at).toLocaleDateString('pt-BR')}
        </span>
      ),
      sortable: true,
      sortValue: (mapping) => new Date(mapping.updated_at).getTime(),
    },
    {
      key: 'actions',
      header: '',
      accessor: (mapping) => isAdmin ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(mapping);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ) : null,
      className: 'w-12',
    },
  ];

  // Search function
  const searchFn = (mapping: SKUMapping, query: string): boolean => {
    const supplier = getSupplierById(mapping.supplier_id);
    const catalogItem = getCatalogItemById(mapping.catalog_item_id);
    
    return (
      mapping.supplier_model_code.toLowerCase().includes(query) ||
      (supplier?.name.toLowerCase().includes(query) ?? false) ||
      (catalogItem?.name.toLowerCase().includes(query) ?? false) ||
      (catalogItem?.sku.toLowerCase().includes(query) ?? false) ||
      (mapping.notes?.toLowerCase().includes(query) ?? false)
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SKU Mapping</h1>
          <p className="text-muted-foreground">
            Mapeamento de códigos de fornecedores para o catálogo interno
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showPendingOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPendingOnly(!showPendingOnly)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Pendentes ({pendingCount})
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Mapping
            </Button>
          )}
        </div>
      </div>

      {/* Alert for pending mappings */}
      {pendingCount > 0 && !showPendingOnly && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">
                {pendingCount} mapeamento{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Existem códigos de fornecedor que ainda não foram vinculados a itens do catálogo.
                Esses itens não poderão ser cotados até serem mapeados.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowPendingOnly(true)}
              >
                Ver pendências
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de Mappings</p>
          <p className="text-2xl font-bold">{skuMappings?.length || 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Mapeados</p>
          <p className="text-2xl font-bold text-success">
            {(skuMappings?.length || 0) - pendingCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-destructive' : ''}`}>
            {pendingCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Fornecedores</p>
          <p className="text-2xl font-bold">
            {new Set(skuMappings?.map(m => m.supplier_id)).size}
          </p>
        </div>
      </div>

      {/* Mapping table */}
      <DataTable
        data={filteredMappings || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar por código, fornecedor, item..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        rowClassName={(mapping) => 
          !mapping.catalog_item_id 
            ? 'bg-destructive/5 hover:bg-destructive/10' 
            : ''
        }
        emptyMessage="Nenhum mapeamento encontrado."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMapping ? 'Editar Mapeamento' : 'Novo Mapeamento'}
            </DialogTitle>
            <DialogDescription>
              {editingMapping 
                ? 'Vincule o código do fornecedor a um item do catálogo.'
                : 'Crie um novo mapeamento de código de fornecedor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingMapping && (
              <>
                <div className="space-y-2">
                  <Label>Fornecedor *</Label>
                  <Select 
                    value={formData.supplier_id}
                    onValueChange={(v) => setFormData(f => ({ ...f, supplier_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.filter(s => s.is_active).map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Código do Fornecedor *</Label>
                  <Input
                    value={formData.supplier_model_code}
                    onChange={(e) => setFormData(f => ({ ...f, supplier_model_code: e.target.value }))}
                    placeholder="Ex: SD-TM-PRO-2024"
                  />
                </div>
              </>
            )}

            {editingMapping && (
              <>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <p className="text-sm font-medium">
                    {getSupplierById(editingMapping.supplier_id)?.name}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Código do Fornecedor</Label>
                  <p className="font-mono text-sm bg-muted px-3 py-2 rounded">
                    {editingMapping.supplier_model_code}
                  </p>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>Item do Catálogo</Label>
              <Select 
                value={formData.catalog_item_id} 
                onValueChange={(v) => setFormData(f => ({ ...f, catalog_item_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems?.filter(c => c.is_active).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </span>
                        <span>{item.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Observações sobre este mapeamento..."
                rows={3}
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
                (!editingMapping && (!formData.supplier_id || !formData.supplier_model_code)) ||
                createMapping.isPending || 
                updateMapping.isPending
              }
            >
              {createMapping.isPending || updateMapping.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
