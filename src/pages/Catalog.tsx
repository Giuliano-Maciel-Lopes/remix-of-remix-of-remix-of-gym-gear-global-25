/**
 * Catalog Page
 * Lists all gym equipment in the catalog using Supabase
 */

import React, { useState } from 'react';
import { Package, Filter, Download, Plus, Edit, Power, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { CategoryBadge, StatusBadge } from '@/components/common/StatusBadge';
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  useCatalogItems, 
  useSupplierPrices, 
  useCreateCatalogItem, 
  useUpdateCatalogItem,
  useDeleteCatalogItem,
  CatalogItem 
} from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

// Categories for filtering
const categories = [
  'Cardio',
  'Strength', 
  'Free Weights',
  'Benches',
  'Functional',
  'Accessories',
] as const;

export default function CatalogPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Cardio' as CatalogItem['category'],
    description: '',
    unit_cbm: 0,
    unit_weight_kg: 0,
    hs_code: '',
    ncm_code: '',
    is_active: true,
  });

  const { data: catalogItems, isLoading } = useCatalogItems();
  const { data: prices } = useSupplierPrices();
  const createItem = useCreateCatalogItem();
  const updateItem = useUpdateCatalogItem();
  const deleteItem = useDeleteCatalogItem();
  const { isAdmin } = useAuth();

  // Filter data by category
  const filteredData = categoryFilter === 'all'
    ? catalogItems
    : catalogItems?.filter(item => item.category === categoryFilter);

  // Get average FOB price for an item
  const getAvgFOB = (itemId: string): number => {
    const itemPrices = prices?.filter(p => p.catalog_item_id === itemId) || [];
    if (itemPrices.length === 0) return 0;
    return itemPrices.reduce((sum, p) => sum + Number(p.price_fob_usd), 0) / itemPrices.length;
  };

  // Open dialog for new item
  const handleNew = () => {
    setEditingItem(null);
    setFormData({
      sku: '',
      name: '',
      category: 'Cardio',
      description: '',
      unit_cbm: 0,
      unit_weight_kg: 0,
      hs_code: '',
      ncm_code: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      description: item.description || '',
      unit_cbm: Number(item.unit_cbm),
      unit_weight_kg: Number(item.unit_weight_kg),
      hs_code: item.hs_code || '',
      ncm_code: item.ncm_code || '',
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  // Toggle active status
  const handleToggleActive = async (item: CatalogItem) => {
    await updateItem.mutateAsync({
      id: item.id,
      is_active: !item.is_active,
    });
  };

  // Delete item permanently
  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteItem.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Save item
  const handleSave = async () => {
    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem.id,
        ...formData,
      });
    } else {
      await createItem.mutateAsync(formData);
    }
    setShowDialog(false);
  };

  // Table columns definition
  const columns: Column<CatalogItem>[] = [
    {
      key: 'sku',
      header: 'SKU',
      accessor: (item) => (
        <span className="font-mono text-sm text-muted-foreground">{item.sku}</span>
      ),
      sortable: true,
      sortValue: (item) => item.sku,
    },
    {
      key: 'name',
      header: 'Nome',
      accessor: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      ),
      sortable: true,
      sortValue: (item) => item.name,
    },
    {
      key: 'category',
      header: 'Categoria',
      accessor: (item) => <CategoryBadge category={item.category} />,
      sortable: true,
      sortValue: (item) => item.category,
    },
    {
      key: 'cbm',
      header: 'CBM',
      accessor: (item) => (
        <span className="text-sm">{formatNumber(Number(item.unit_cbm), 2)} m³</span>
      ),
      sortable: true,
      sortValue: (item) => Number(item.unit_cbm),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'weight',
      header: 'Peso',
      accessor: (item) => (
        <span className="text-sm">{formatNumber(Number(item.unit_weight_kg), 1)} kg</span>
      ),
      sortable: true,
      sortValue: (item) => Number(item.unit_weight_kg),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'codes',
      header: 'HS/NCM',
      accessor: (item) => (
        <div className="text-xs">
          <p><span className="text-muted-foreground">HS:</span> {item.hs_code || '-'}</p>
          <p><span className="text-muted-foreground">NCM:</span> {item.ncm_code || '-'}</p>
        </div>
      ),
    },
    {
      key: 'avg_fob',
      header: 'FOB Médio',
      accessor: (item) => {
        const avgFob = getAvgFOB(item.id);
        return avgFob > 0 
          ? <span className="font-medium">{formatCurrency(avgFob)}</span>
          : <span className="text-muted-foreground text-sm">Sem preço</span>;
      },
      sortable: true,
      sortValue: (item) => getAvgFOB(item.id),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => (
        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
      ),
      sortable: true,
      sortValue: (item) => item.is_active ? 1 : 0,
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (item) => isAdmin ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={item.is_active ? 'Desativar' : 'Ativar'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(item);
            }}
          >
            <Power className={`w-4 h-4 ${item.is_active ? 'text-success' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Excluir"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(item);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : null,
      className: 'w-32',
    },
  ];

  // Search function
  const searchFn = (item: CatalogItem, query: string): boolean => {
    return (
      item.sku.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.description?.toLowerCase().includes(query) ?? false) ||
      (item.hs_code?.includes(query) ?? false) ||
      (item.ncm_code?.includes(query) ?? false)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((_, i) => (
            <Skeleton key={i} className="h-20" />
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
          <h1 className="text-2xl font-bold text-foreground">Catálogo</h1>
          <p className="text-muted-foreground">
            {filteredData?.length || 0} equipamentos de academia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {categoryFilter !== 'all' && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map(category => {
          const count = catalogItems?.filter(c => c.category === category).length || 0;
          const isSelected = categoryFilter === category;
          
          return (
            <button
              key={category}
              onClick={() => setCategoryFilter(isSelected ? 'all' : category)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                isSelected 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted/50'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {category}
              </p>
            </button>
          );
        })}
      </div>

      {/* Data table */}
      <DataTable
        data={filteredData || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar por SKU, nome, categoria..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        emptyMessage="Nenhum equipamento encontrado."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Novo Item do Catálogo'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Atualize as informações do item.' 
                : 'Preencha os dados para criar um novo item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(f => ({ ...f, sku: e.target.value }))}
                  placeholder="TRD-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(v) => setFormData(f => ({ ...f, category: v as CatalogItem['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do equipamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Descrição do equipamento..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cbm">CBM (m³)</Label>
                <Input
                  id="cbm"
                  type="number"
                  step="0.01"
                  value={formData.unit_cbm}
                  onChange={(e) => setFormData(f => ({ ...f, unit_cbm: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.unit_weight_kg}
                  onChange={(e) => setFormData(f => ({ ...f, unit_weight_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hs_code">Código HS</Label>
                <Input
                  id="hs_code"
                  value={formData.hs_code}
                  onChange={(e) => setFormData(f => ({ ...f, hs_code: e.target.value }))}
                  placeholder="9506.91"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ncm_code">Código NCM</Label>
                <Input
                  id="ncm_code"
                  value={formData.ncm_code}
                  onChange={(e) => setFormData(f => ({ ...f, ncm_code: e.target.value }))}
                  placeholder="9506.91.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.sku || !formData.name || createItem.isPending || updateItem.isPending}
            >
              {createItem.isPending || updateItem.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.name || ''}
        itemType="Item do Catálogo"
        onConfirm={handleDelete}
        isLoading={deleteItem.isPending}
        isSoftDelete={false}
      />
    </div>
  );
}
