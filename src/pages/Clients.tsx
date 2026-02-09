/**
 * Clients Page
 * CRUD operations for clients
 */

import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, MapPin, Edit, Power, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog';
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
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, Client } from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const countries = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
];

const currencies = ['USD', 'CNY', 'EUR', 'BRL', 'ARS'] as const;

export default function ClientsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country: 'BR',
    default_currency: 'USD' as 'USD' | 'CNY' | 'EUR' | 'BRL' | 'ARS',
    contact_email: '',
    contact_phone: '',
    notes: '',
    is_active: true,
  });

  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const { isAdmin } = useAuth();

  // Filter clients
  const filteredClients = showInactive 
    ? clients 
    : clients?.filter(c => c.is_active);

  // Open dialog for new client
  const handleNew = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      country: 'BR',
      default_currency: 'USD',
      contact_email: '',
      contact_phone: '',
      notes: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  // Open dialog for editing
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      country: client.country,
      default_currency: client.default_currency,
      contact_email: client.contact_email || '',
      contact_phone: client.contact_phone || '',
      notes: client.notes || '',
      is_active: client.is_active,
    });
    setShowDialog(true);
  };

  // Toggle active status (soft delete)
  const handleToggleActive = async (client: Client) => {
    await updateClient.mutateAsync({
      id: client.id,
      is_active: !client.is_active,
    });
  };

  // Delete client permanently
  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteClient.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Save client
  const handleSave = async () => {
    if (editingClient) {
      await updateClient.mutateAsync({
        id: editingClient.id,
        ...formData,
      });
    } else {
      await createClient.mutateAsync(formData);
    }
    setShowDialog(false);
  };

  // Table columns
  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Cliente',
      accessor: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{client.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {countries.find(c => c.code === client.country)?.name || client.country}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      sortValue: (client) => client.name,
    },
    {
      key: 'contact',
      header: 'Contato',
      accessor: (client) => (
        <div className="text-sm space-y-1">
          {client.contact_email && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {client.contact_email}
            </p>
          )}
          {client.contact_phone && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {client.contact_phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'currency',
      header: 'Moeda',
      accessor: (client) => (
        <span className="font-mono text-sm">{client.default_currency}</span>
      ),
      sortable: true,
      sortValue: (client) => client.default_currency,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (client) => (
        <StatusBadge status={client.is_active ? 'active' : 'inactive'} />
      ),
      sortable: true,
      sortValue: (client) => client.is_active ? 1 : 0,
    },
    {
      key: 'notes',
      header: 'Observações',
      accessor: (client) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
          {client.notes || '-'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: (client) => isAdmin ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(client);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={client.is_active ? 'Desativar' : 'Ativar'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(client);
            }}
          >
            <Power className={`w-4 h-4 ${client.is_active ? 'text-success' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Excluir"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(client);
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
  const searchFn = (client: Client, query: string): boolean => {
    return (
      client.name.toLowerCase().includes(query) ||
      client.country.toLowerCase().includes(query) ||
      (client.contact_email?.toLowerCase().includes(query) ?? false) ||
      (client.notes?.toLowerCase().includes(query) ?? false)
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
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            {filteredClients?.length || 0} clientes {!showInactive && 'ativos'}
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
          {isAdmin && (
            <Button size="sm" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{clients?.length || 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-success">
            {clients?.filter(c => c.is_active).length || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Brasil</p>
          <p className="text-2xl font-bold">
            {clients?.filter(c => c.country === 'BR').length || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Argentina</p>
          <p className="text-2xl font-bold">
            {clients?.filter(c => c.country === 'AR').length || 0}
          </p>
        </div>
      </div>

      {/* Client table */}
      <DataTable
        data={filteredClients || []}
        columns={columns}
        searchable
        searchPlaceholder="Buscar cliente..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        rowClassName={(client) => !client.is_active ? 'opacity-60' : ''}
        emptyMessage="Nenhum cliente encontrado."
      />

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient 
                ? 'Atualize as informações do cliente.' 
                : 'Preencha os dados para criar um novo cliente.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do cliente"
              />
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
                  onValueChange={(v) => setFormData(f => ({ ...f, default_currency: v as typeof formData.default_currency }))}
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="email@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData(f => ({ ...f, contact_phone: e.target.value }))}
                placeholder="+55 11 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Observações sobre o cliente..."
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
              disabled={!formData.name || createClient.isPending || updateClient.isPending}
            >
              {createClient.isPending || updateClient.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.name || ''}
        itemType="Cliente"
        onConfirm={handleDelete}
        isLoading={deleteClient.isPending}
        isSoftDelete={false}
      />
    </div>
  );
}
