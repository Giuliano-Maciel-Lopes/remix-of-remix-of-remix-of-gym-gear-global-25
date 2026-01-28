/**
 * SKU Mapping Page
 * Maps supplier product codes to internal catalog items
 * Highlights pending mappings that need attention
 */

import React, { useState } from 'react';
import { Link2, AlertTriangle, Check, Search, Edit, Plus } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  skuMappings, 
  suppliers, 
  catalogItems,
  getSupplierById,
  getCatalogItemById 
} from '@/data/mockData';
import type { SKUMapping } from '@/types';

export default function SKUMappingPage() {
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SKUMapping | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>('');

  // Filter mappings
  const filteredMappings = showPendingOnly
    ? skuMappings.filter(m => m.catalog_item_id === null)
    : skuMappings;

  // Count pending
  const pendingCount = skuMappings.filter(m => m.catalog_item_id === null).length;

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
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse-subtle">
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
            <Badge variant="destructive" className="animate-pulse-subtle">
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
      sortValue: (mapping) => getCatalogItemById(mapping.catalog_item_id ?? '')?.name ?? 'zzz',
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
      accessor: (mapping) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingMapping(mapping);
            setSelectedCatalogItem(mapping.catalog_item_id ?? '');
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
      className: 'w-12',
    },
  ];

  // Search function
  const searchFn = (mapping: SKUMapping, query: string): boolean => {
    const supplier = getSupplierById(mapping.supplier_id);
    const catalogItem = mapping.catalog_item_id 
      ? getCatalogItemById(mapping.catalog_item_id) 
      : null;
    
    return (
      mapping.supplier_model_code.toLowerCase().includes(query) ||
      (supplier?.name.toLowerCase().includes(query) ?? false) ||
      (catalogItem?.name.toLowerCase().includes(query) ?? false) ||
      (catalogItem?.sku.toLowerCase().includes(query) ?? false) ||
      (mapping.notes?.toLowerCase().includes(query) ?? false)
    );
  };

  // Handle save (mock)
  const handleSave = () => {
    // Mock save - in real app would update data
    console.log('Saving mapping:', editingMapping?.id, 'to catalog item:', selectedCatalogItem);
    setEditingMapping(null);
  };

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
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Mapping
          </Button>
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
          <p className="text-2xl font-bold">{skuMappings.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Mapeados</p>
          <p className="text-2xl font-bold text-success">
            {skuMappings.length - pendingCount}
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
            {new Set(skuMappings.map(m => m.supplier_id)).size}
          </p>
        </div>
      </div>

      {/* Mapping table */}
      <DataTable
        data={filteredMappings}
        columns={columns}
        searchable
        searchPlaceholder="Buscar por código, fornecedor, item..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        rowClassName={(mapping) => 
          mapping.catalog_item_id === null 
            ? 'bg-destructive/5 hover:bg-destructive/10' 
            : ''
        }
        emptyMessage="Nenhum mapeamento encontrado."
      />

      {/* Edit dialog */}
      <Dialog open={!!editingMapping} onOpenChange={() => setEditingMapping(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mapeamento</DialogTitle>
            <DialogDescription>
              Vincule o código do fornecedor a um item do catálogo.
            </DialogDescription>
          </DialogHeader>
          
          {editingMapping && (
            <div className="space-y-4 py-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="catalog-item">Item do Catálogo</Label>
                <Select 
                  value={selectedCatalogItem} 
                  onValueChange={setSelectedCatalogItem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogItems.filter(c => c.is_active).map(item => (
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
              
              {editingMapping.notes && (
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {editingMapping.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMapping(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!selectedCatalogItem}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
