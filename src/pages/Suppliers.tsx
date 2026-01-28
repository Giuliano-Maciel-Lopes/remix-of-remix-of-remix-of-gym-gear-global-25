/**
 * Suppliers Page
 * Lists all suppliers with filtering and status management
 */

import React, { useState } from 'react';
import { Building2, Plus, Mail, Phone, Clock, MapPin, Check, X } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { suppliers, getMappingsForSupplier } from '@/data/mockData';
import type { Supplier } from '@/types';

export default function SuppliersPage() {
  const [showInactive, setShowInactive] = useState(false);

  // Filter suppliers based on active status
  const filteredSuppliers = showInactive 
    ? suppliers 
    : suppliers.filter(s => s.is_active);

  // Count SKU mappings for each supplier
  const getMappingCount = (supplierId: string): number => {
    return getMappingsForSupplier(supplierId).length;
  };

  // Table columns
  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Fornecedor',
      accessor: (supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{supplier.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {supplier.country === 'CN' ? 'China' : supplier.country}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      sortValue: (supplier) => supplier.name,
    },
    {
      key: 'contact',
      header: 'Contato',
      accessor: (supplier) => (
        <div className="text-sm space-y-1">
          {supplier.contact_email && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {supplier.contact_email}
            </p>
          )}
          {supplier.contact_phone && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {supplier.contact_phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'currency',
      header: 'Moeda',
      accessor: (supplier) => (
        <span className="font-mono text-sm">{supplier.default_currency}</span>
      ),
      sortable: true,
      sortValue: (supplier) => supplier.default_currency,
    },
    {
      key: 'incoterm',
      header: 'Incoterm',
      accessor: (supplier) => (
        <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
          {supplier.incoterm_default}
        </span>
      ),
      sortable: true,
      sortValue: (supplier) => supplier.incoterm_default,
    },
    {
      key: 'lead_time',
      header: 'Lead Time',
      accessor: (supplier) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{supplier.lead_time_days}</span>
          <span className="text-muted-foreground text-sm">dias</span>
        </div>
      ),
      sortable: true,
      sortValue: (supplier) => supplier.lead_time_days,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'mappings',
      header: 'SKUs',
      accessor: (supplier) => {
        const count = getMappingCount(supplier.id);
        return (
          <span className={`font-medium ${count === 0 ? 'text-muted-foreground' : ''}`}>
            {count}
          </span>
        );
      },
      sortable: true,
      sortValue: (supplier) => getMappingCount(supplier.id),
      className: 'text-center',
      headerClassName: 'text-center',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (supplier) => (
        <StatusBadge status={supplier.is_active ? 'active' : 'inactive'} />
      ),
      sortable: true,
      sortValue: (supplier) => supplier.is_active ? 1 : 0,
    },
    {
      key: 'notes',
      header: 'Observações',
      accessor: (supplier) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
          {supplier.notes || '-'}
        </p>
      ),
    },
  ];

  // Search function
  const searchFn = (supplier: Supplier, query: string): boolean => {
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.country.toLowerCase().includes(query) ||
      (supplier.contact_email?.toLowerCase().includes(query) ?? false) ||
      (supplier.notes?.toLowerCase().includes(query) ?? false)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">
            {filteredSuppliers.length} fornecedores {!showInactive && 'ativos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Mostrar Inativos
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Ocultar Inativos
              </>
            )}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Ativos</p>
          <p className="text-2xl font-bold text-success">
            {suppliers.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Inativos</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {suppliers.filter(s => !s.is_active).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Lead Time Médio</p>
          <p className="text-2xl font-bold">
            {Math.round(
              suppliers.filter(s => s.is_active)
                .reduce((sum, s) => sum + s.lead_time_days, 0) / 
              suppliers.filter(s => s.is_active).length
            )} dias
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">País Principal</p>
          <p className="text-2xl font-bold">🇨🇳 China</p>
        </div>
      </div>

      {/* Supplier table */}
      <DataTable
        data={filteredSuppliers}
        columns={columns}
        searchable
        searchPlaceholder="Buscar fornecedor..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        rowClassName={(supplier) => !supplier.is_active ? 'opacity-60' : ''}
        emptyMessage="Nenhum fornecedor encontrado."
      />
    </div>
  );
}
