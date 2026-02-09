/**
 * Quotes Page
 * Lists all quotes/orders using Supabase with status, calculations, and actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Copy, 
  Eye, 
  FileSpreadsheet,
  FileText,
  Calculator,
  TrendingUp,
  Package,
  Trash2,
  Edit
} from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge, CountryBadge, ContainerBadge } from '@/components/common/StatusBadge';
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useQuotes, 
  useClients,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  Quote
} from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuotesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);
  
  // Form state for new/edit quote
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    destination_country: 'BR' as Quote['destination_country'],
    container_type: '40HC' as Quote['container_type'],
    freight_per_container_usd: 3500,
    insurance_rate: 0.005,
    fixed_costs_usd: 500,
  });

  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: clients } = useClients();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const { user, isAdmin } = useAuth();

  // Filter quotes by status
  const filteredQuotes = statusFilter === 'all'
    ? quotes
    : quotes?.filter(q => q.status === statusFilter);

  // Open dialog for new quote
  const handleNew = () => {
    setEditingQuote(null);
    setFormData({
      name: '',
      client_id: '',
      destination_country: 'BR',
      container_type: '40HC',
      freight_per_container_usd: 3500,
      insurance_rate: 0.005,
      fixed_costs_usd: 500,
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      name: quote.name,
      client_id: quote.client_id || '',
      destination_country: quote.destination_country,
      container_type: quote.container_type,
      freight_per_container_usd: Number(quote.freight_per_container_usd),
      insurance_rate: Number(quote.insurance_rate),
      fixed_costs_usd: Number(quote.fixed_costs_usd),
    });
    setShowDialog(true);
  };

  // Delete quote permanently
  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteQuote.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Duplicate quote
  const handleDuplicate = async (quote: Quote) => {
    await createQuote.mutateAsync({
      name: `${quote.name} (Cópia)`,
      client_id: quote.client_id || undefined,
      destination_country: quote.destination_country,
      container_type: quote.container_type,
      freight_per_container_usd: quote.freight_per_container_usd,
      insurance_rate: quote.insurance_rate,
      fixed_costs_usd: quote.fixed_costs_usd,
      status: 'draft',
      created_by: user?.id,
    });
  };

  // Save quote
  const handleSave = async () => {
    if (editingQuote) {
      await updateQuote.mutateAsync({
        id: editingQuote.id,
        ...formData,
        client_id: formData.client_id || undefined,
      });
    } else {
      await createQuote.mutateAsync({
        ...formData,
        client_id: formData.client_id || undefined,
        status: 'draft',
        created_by: user?.id,
      });
    }
    setShowDialog(false);
  };

  // Table columns
  const columns: Column<Quote>[] = [
    {
      key: 'name',
      header: 'Pedido',
      accessor: (quote) => (
        <div>
          <p className="font-medium text-foreground">{quote.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(quote.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      ),
      sortable: true,
      sortValue: (quote) => quote.name,
    },
    {
      key: 'client',
      header: 'Cliente',
      accessor: (quote) => {
        const client = clients?.find(c => c.id === quote.client_id);
        return client ? (
          <span className="text-sm">{client.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (quote) => <StatusBadge status={quote.status} />,
      sortable: true,
      sortValue: (quote) => quote.status,
    },
    {
      key: 'destination',
      header: 'Destino',
      accessor: (quote) => (
        <CountryBadge country={quote.destination_country} />
      ),
      sortable: true,
      sortValue: (quote) => quote.destination_country,
    },
    {
      key: 'container',
      header: 'Container',
      accessor: (quote) => (
        <ContainerBadge type={quote.container_type} />
      ),
    },
    {
      key: 'freight',
      header: 'Frete/Cont.',
      accessor: (quote) => (
        <span className="font-medium">{formatCurrency(Number(quote.freight_per_container_usd))}</span>
      ),
      sortable: true,
      sortValue: (quote) => Number(quote.freight_per_container_usd),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'date',
      header: 'Atualizado',
      accessor: (quote) => (
        <span className="text-sm text-muted-foreground">
          {new Date(quote.updated_at).toLocaleDateString('pt-BR')}
        </span>
      ),
      sortable: true,
      sortValue: (quote) => new Date(quote.updated_at).getTime(),
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (quote) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => handleEdit(quote)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDuplicate(quote)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Google Sheet
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteTarget(quote)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  // Search function
  const searchFn = (quote: Quote, query: string): boolean => {
    const client = clients?.find(c => c.id === quote.client_id);
    return (
      quote.name.toLowerCase().includes(query) ||
      quote.status.toLowerCase().includes(query) ||
      quote.destination_country.toLowerCase().includes(query) ||
      (client?.name.toLowerCase().includes(query) ?? false)
    );
  };

  // Status counts
  const statusCounts = {
    all: quotes?.length || 0,
    draft: quotes?.filter(q => q.status === 'draft').length || 0,
    pending: quotes?.filter(q => q.status === 'pending').length || 0,
    approved: quotes?.filter(q => q.status === 'approved').length || 0,
    ordered: quotes?.filter(q => q.status === 'ordered').length || 0,
  };

  if (loadingQuotes) {
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
          <h1 className="text-2xl font-bold text-foreground">Pedidos / Cotações</h1>
          <p className="text-muted-foreground">
            Gerencie cotações e pedidos de importação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/comparator')}>
            <Calculator className="w-4 h-4 mr-2" />
            Comparativo
          </Button>
          <Button size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Cotação
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pedidos</p>
              <p className="text-xl font-bold">{quotes?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rascunhos</p>
              <p className="text-xl font-bold">{statusCounts.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold">{statusCounts.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aprovados</p>
              <p className="text-xl font-bold">{statusCounts.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg w-fit">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'draft', label: 'Rascunho' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'approved', label: 'Aprovados' },
          { key: 'ordered', label: 'Pedidos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === key
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">
              ({statusCounts[key as keyof typeof statusCounts]})
            </span>
          </button>
        ))}
      </div>

      {/* Quotes table */}
      <DataTable
        data={filteredQuotes || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar cotação..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        onRowClick={(quote) => navigate(`/quotes/${quote.id}`)}
        emptyMessage="Nenhuma cotação encontrada."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? 'Editar Cotação' : 'Nova Cotação'}
            </DialogTitle>
            <DialogDescription>
              {editingQuote 
                ? 'Atualize as informações da cotação.'
                : 'Crie uma nova cotação de importação.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Cotação *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Pedido Academia XYZ - Jan 2025"
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select 
                value={formData.client_id}
                onValueChange={(v) => setFormData(f => ({ ...f, client_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.filter(c => c.is_active).map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País de Destino</Label>
                <Select 
                  value={formData.destination_country}
                  onValueChange={(v) => setFormData(f => ({ ...f, destination_country: v as Quote['destination_country'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                    <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                    <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Container</Label>
                <Select 
                  value={formData.container_type}
                  onValueChange={(v) => setFormData(f => ({ ...f, container_type: v as Quote['container_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20FT">20' (33 m³)</SelectItem>
                    <SelectItem value="40FT">40' (67 m³)</SelectItem>
                    <SelectItem value="40HC">40'HC (76 m³)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frete/Container (USD)</Label>
                <Input
                  type="number"
                  value={formData.freight_per_container_usd}
                  onChange={(e) => setFormData(f => ({ ...f, freight_per_container_usd: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Custos Fixos (USD)</Label>
                <Input
                  type="number"
                  value={formData.fixed_costs_usd}
                  onChange={(e) => setFormData(f => ({ ...f, fixed_costs_usd: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Taxa de Seguro (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.insurance_rate * 100}
                onChange={(e) => setFormData(f => ({ ...f, insurance_rate: (parseFloat(e.target.value) || 0) / 100 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || createQuote.isPending || updateQuote.isPending}
            >
              {createQuote.isPending || updateQuote.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.name || ''}
        itemType="Cotação"
        onConfirm={handleDelete}
        isLoading={deleteQuote.isPending}
        isSoftDelete={false}
      />
    </div>
  );
}
