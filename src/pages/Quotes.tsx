/**
 * Quotes Page
 * Lists all quotes/orders with status, calculations, and actions
 * Shows FOB, CIF, and landed cost comparisons
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
  Package
} from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge, CountryBadge, ContainerBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  quotes, 
  getSupplierById, 
  getCatalogItemById,
  getSupplierPrice
} from '@/data/mockData';
import { formatCurrency, calculateQuote, getLandedForDestination } from '@/lib/calculations';
import type { Quote } from '@/types';

export default function QuotesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter quotes by status
  const filteredQuotes = statusFilter === 'all'
    ? quotes
    : quotes.filter(q => q.status === statusFilter);

  // Calculate quote totals
  const getQuoteTotals = (quote: Quote) => {
    try {
      const calc = calculateQuote(quote);
      const landed = getLandedForDestination(calc, quote.destination_country);
      return {
        fob: calc.total_fob,
        cif: calc.cif_total,
        landed,
        containers: calc.container_qty,
        cbm: calc.total_cbm,
      };
    } catch {
      // Fallback if calculation fails (missing data)
      return {
        fob: quote.lines.reduce((sum, line) => {
          const price = getSupplierPrice(line.chosen_supplier_id, line.catalog_item_id);
          return sum + (line.qty * (price?.price_fob_usd ?? 0));
        }, 0),
        cif: 0,
        landed: 0,
        containers: 1,
        cbm: quote.lines.reduce((sum, line) => {
          const item = getCatalogItemById(line.catalog_item_id);
          return sum + (line.qty * (item?.unit_cbm ?? 0));
        }, 0),
      };
    }
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
            {quote.lines.length} item(s)
          </p>
        </div>
      ),
      sortable: true,
      sortValue: (quote) => quote.name,
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
      accessor: (quote) => {
        const totals = getQuoteTotals(quote);
        return (
          <div className="flex items-center gap-2">
            <ContainerBadge type={quote.container_type} />
            <span className="text-sm text-muted-foreground">
              × {totals.containers}
            </span>
          </div>
        );
      },
    },
    {
      key: 'fob',
      header: 'FOB Total',
      accessor: (quote) => {
        const totals = getQuoteTotals(quote);
        return (
          <span className="font-medium">{formatCurrency(totals.fob)}</span>
        );
      },
      sortable: true,
      sortValue: (quote) => getQuoteTotals(quote).fob,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'landed',
      header: 'Landed',
      accessor: (quote) => {
        const totals = getQuoteTotals(quote);
        return (
          <div className="text-right">
            <span className="font-medium">{formatCurrency(totals.landed)}</span>
            <p className="text-xs text-muted-foreground">
              {quote.destination_country}
            </p>
          </div>
        );
      },
      sortable: true,
      sortValue: (quote) => getQuoteTotals(quote).landed,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'cbm',
      header: 'CBM',
      accessor: (quote) => {
        const totals = getQuoteTotals(quote);
        return (
          <span className="text-sm">{totals.cbm.toFixed(2)} m³</span>
        );
      },
      sortable: true,
      sortValue: (quote) => getQuoteTotals(quote).cbm,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'date',
      header: 'Data',
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
      header: '',
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
            <DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  // Search function
  const searchFn = (quote: Quote, query: string): boolean => {
    return (
      quote.name.toLowerCase().includes(query) ||
      quote.status.toLowerCase().includes(query) ||
      quote.destination_country.toLowerCase().includes(query)
    );
  };

  // Status counts
  const statusCounts = {
    all: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    pending: quotes.filter(q => q.status === 'pending').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    ordered: quotes.filter(q => q.status === 'ordered').length,
  };

  // Calculate summary stats
  const totalFOB = quotes.reduce((sum, q) => sum + getQuoteTotals(q).fob, 0);
  const totalContainers = quotes.reduce((sum, q) => sum + getQuoteTotals(q).containers, 0);

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
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 mr-2" />
            Comparativo
          </Button>
          <Button size="sm">
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
              <p className="text-xl font-bold">{quotes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">FOB Total</p>
              <p className="text-xl font-bold">{formatCurrency(totalFOB)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contêineres</p>
              <p className="text-xl font-bold">{totalContainers}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold">{statusCounts.pending}</p>
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
        data={filteredQuotes}
        columns={columns}
        searchable
        searchPlaceholder="Buscar cotação..."
        searchFn={searchFn}
        paginated
        pageSize={10}
        onRowClick={(quote) => navigate(`/quotes/${quote.id}`)}
        emptyMessage="Nenhuma cotação encontrada."
      />
    </div>
  );
}
