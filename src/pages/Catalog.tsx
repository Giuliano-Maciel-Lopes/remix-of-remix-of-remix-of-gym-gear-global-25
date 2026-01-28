/**
 * Catalog Page
 * Lists all gym equipment in the catalog
 * Supports filtering, searching, sorting, and pagination
 */

import React, { useState } from 'react';
import { Package, Filter, Download, Plus } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { CategoryBadge, StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { catalogItems, getPricesForCatalogItem } from '@/data/mockData';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import type { CatalogItem, EquipmentCategory } from '@/types';

// Categories for filtering
const categories: EquipmentCategory[] = [
  'Cardio',
  'Strength', 
  'Free Weights',
  'Benches',
  'Functional',
  'Accessories',
];

export default function CatalogPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter data by category
  const filteredData = categoryFilter === 'all'
    ? catalogItems
    : catalogItems.filter(item => item.category === categoryFilter);

  // Get average FOB price for an item
  const getAvgFOB = (itemId: string): number => {
    const prices = getPricesForCatalogItem(itemId);
    if (prices.length === 0) return 0;
    return prices.reduce((sum, p) => sum + p.price_fob_usd, 0) / prices.length;
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
        <span className="text-sm">{formatNumber(item.unit_cbm, 2)} m³</span>
      ),
      sortable: true,
      sortValue: (item) => item.unit_cbm,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'weight',
      header: 'Peso',
      accessor: (item) => (
        <span className="text-sm">{formatNumber(item.unit_weight_kg, 1)} kg</span>
      ),
      sortable: true,
      sortValue: (item) => item.unit_weight_kg,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'codes',
      header: 'HS/NCM',
      accessor: (item) => (
        <div className="text-xs">
          <p><span className="text-muted-foreground">HS:</span> {item.hs_code}</p>
          <p><span className="text-muted-foreground">NCM:</span> {item.ncm_code}</p>
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
  ];

  // Search function
  const searchFn = (item: CatalogItem, query: string): boolean => {
    return (
      item.sku.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.hs_code.includes(query) ||
      item.ncm_code.includes(query)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo</h1>
          <p className="text-muted-foreground">
            {filteredData.length} equipamentos de academia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
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
          const count = catalogItems.filter(c => c.category === category).length;
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
        data={filteredData}
        columns={columns}
        searchable
        searchPlaceholder="Buscar por SKU, nome, categoria..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        emptyMessage="Nenhum equipamento encontrado."
      />
    </div>
  );
}
