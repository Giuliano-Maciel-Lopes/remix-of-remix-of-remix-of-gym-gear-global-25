/**
 * Suppliers Page
 * Lists all suppliers with filtering and status management
 */

import React, { useState } from 'react';
import { Building2, Plus, Mail, Phone, Clock, MapPin, Edit, Power, Trash2, Download } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormError } from '@/components/common/FormError';
import { Button } from '@/components/ui/button';
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
  useSuppliers, 
  useSKUMappings, 
  useCreateSupplier, 
  useUpdateSupplier,
  useDeleteSupplier,
  Supplier 
} from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { exportToExcel, formatDateBR, formatStatus } from '@/lib/exportExcel';
import { supplierSchema, validateForm, ValidationErrors } from '@/lib/validationSchemas';

const countries = [
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
];

const currencies = ['USD', 'CNY', 'EUR'] as const;
const incoterms = ['FOB', 'CIF', 'EXW', 'DDP'] as const;

export default function SuppliersPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country: 'CN',
    default_currency: 'USD' as Supplier['default_currency'],
    incoterm_default: 'FOB' as Supplier['incoterm_default'],
    lead_time_days: 30,
    contact_email: '',
    contact_phone: '',
    notes: '',
    is_active: true,
  });

  const { data: suppliers, isLoading } = useSuppliers();
  const { data: skuMappings } = useSKUMappings();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const { isAdmin } = useAuth();

  // Filter suppliers based on active status
  const filteredSuppliers = showInactive 
    ? suppliers 
    : suppliers?.filter(s => s.is_active);

  // Count SKU mappings for each supplier
  const getMappingCount = (supplierId: string): number => {
    return skuMappings?.filter(m => m.supplier_id === supplierId).length || 0;
  };

  // Open dialog for new supplier
  const handleNew = () => {
    setEditingSupplier(null);
    setFormErrors({});
    setFormData({
      name: '',
      country: 'CN',
      default_currency: 'USD',
      incoterm_default: 'FOB',
      lead_time_days: 30,
      contact_email: '',
      contact_phone: '',
      notes: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormErrors({});
    setFormData({
      name: supplier.name,
      country: supplier.country,
      default_currency: supplier.default_currency,
      incoterm_default: supplier.incoterm_default,
      lead_time_days: supplier.lead_time_days,
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      notes: supplier.notes || '',
      is_active: supplier.is_active,
    });
    setShowDialog(true);
  };

  // Toggle active status
  const handleToggleActive = async (supplier: Supplier) => {
    await updateSupplier.mutateAsync({
      id: supplier.id,
      is_active: !supplier.is_active,
    });
  };

  // Delete supplier permanently
  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteSupplier.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Save supplier with validation
  const handleSave = async () => {
    const { success, errors } = validateForm(supplierSchema, formData);
    if (!success) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (editingSupplier) {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        ...formData,
      });
    } else {
      await createSupplier.mutateAsync(formData);
    }
    setShowDialog(false);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredSuppliers?.length) return;
    exportToExcel(filteredSuppliers, [
      { header: 'Nome', accessor: (s) => s.name },
      { header: 'País', accessor: (s) => countries.find(c => c.code === s.country)?.name || s.country },
      { header: 'Moeda', accessor: (s) => s.default_currency },
      { header: 'Incoterm', accessor: (s) => s.incoterm_default },
      { header: 'Lead Time (dias)', accessor: (s) => s.lead_time_days },
      { header: 'Email', accessor: (s) => s.contact_email || '-' },
      { header: 'Telefone', accessor: (s) => s.contact_phone || '-' },
      { header: 'Status', accessor: (s) => formatStatus(s.is_active) },
      { header: 'Data de Criação', accessor: (s) => formatDateBR(s.created_at) },
    ], 'fornecedores');
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
              {countries.find(c => c.code === supplier.country)?.name || supplier.country}
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
      key: 'actions',
      header: 'Ações',
      accessor: (supplier) => isAdmin ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(supplier);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={supplier.is_active ? 'Desativar' : 'Ativar'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(supplier);
            }}
          >
            <Power className={`w-4 h-4 ${supplier.is_active ? 'text-success' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Excluir"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(supplier);
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
  const searchFn = (supplier: Supplier, query: string): boolean => {
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.country.toLowerCase().includes(query) ||
      (supplier.contact_email?.toLowerCase().includes(query) ?? false) ||
      (supplier.notes?.toLowerCase().includes(query) ?? false)
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
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">
            {filteredSuppliers?.length || 0} fornecedores {!showInactive && 'ativos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Ocultar Inativos' : 'Mostrar Inativos'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Ativos</p>
          <p className="text-2xl font-bold text-success">
            {suppliers?.filter(s => s.is_active).length || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Inativos</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {suppliers?.filter(s => !s.is_active).length || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Lead Time Médio</p>
          <p className="text-2xl font-bold">
            {suppliers && suppliers.filter(s => s.is_active).length > 0
              ? Math.round(
                  suppliers.filter(s => s.is_active)
                    .reduce((sum, s) => sum + s.lead_time_days, 0) / 
                  suppliers.filter(s => s.is_active).length
                )
              : 0} dias
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">País Principal</p>
          <p className="text-2xl font-bold">🇨🇳 China</p>
        </div>
      </div>

      {/* Supplier table */}
      <DataTable
        data={filteredSuppliers || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar fornecedor..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        rowClassName={(supplier) => !supplier.is_active ? 'opacity-60' : ''}
        emptyMessage="Nenhum fornecedor encontrado."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier 
                ? 'Atualize as informações do fornecedor.' 
                : 'Preencha os dados para criar um novo fornecedor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do fornecedor"
              />
              <FormError error={formErrors.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select 
                  value={formData.country}
                  onValueChange={(v) => setFormData(f => ({ ...f, country: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select 
                  value={formData.default_currency}
                  onValueChange={(v) => setFormData(f => ({ ...f, default_currency: v as Supplier['default_currency'] }))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incoterm">Incoterm</Label>
                <Select 
                  value={formData.incoterm_default}
                  onValueChange={(v) => setFormData(f => ({ ...f, incoterm_default: v as Supplier['incoterm_default'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {incoterms.map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_time">Lead Time (dias)</Label>
                <Input
                  id="lead_time"
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData(f => ({ ...f, lead_time_days: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="email@fornecedor.com"
              />
              <FormError error={formErrors.contact_email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData(f => ({ ...f, contact_phone: e.target.value }))}
                placeholder="+86 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Observações sobre o fornecedor..."
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
              disabled={!formData.name || createSupplier.isPending || updateSupplier.isPending}
            >
              {createSupplier.isPending || updateSupplier.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.name || ''}
        itemType="Fornecedor"
        onConfirm={handleDelete}
        isLoading={deleteSupplier.isPending}
        isSoftDelete={false}
      />
    </div>
  );
}
