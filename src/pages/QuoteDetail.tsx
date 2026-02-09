/**
 * Quote Detail Page
 * Shows complete quote breakdown with calculations
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  FileText, 
  Edit, 
  Copy,
  Calculator,
  Package,
  Ship,
  Shield,
  DollarSign,
  Truck,
  Building2,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, CountryBadge, ContainerBadge, CategoryBadge } from '@/components/common/StatusBadge';
import { 
  useQuoteWithLines,
  useCatalogItems,
  useSuppliers,
  useSupplierPrices,
  useCreateQuoteLine,
  useDeleteQuoteLine,
  useUpdateQuote
} from '@/hooks/useApiQuery';
import { 
  formatCurrency, 
  formatNumber
} from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAuth } from '@/contexts/AuthContext';

// Container capacities
const CONTAINER_CBM = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
};

// Duty rates
const DUTY_RATES = {
  US: 0.301,
  AR_STANDARD: 0.8081,
  AR_SIMPLIFIED: 0.51,
  BR: 0.668,
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [showAddLineDialog, setShowAddLineDialog] = useState(false);
  const [lineFormData, setLineFormData] = useState({
    catalog_item_id: '',
    chosen_supplier_id: '',
    qty: 1,
    override_price_fob_usd: '',
  });

  const { data: quoteData, isLoading: loadingQuote } = useQuoteWithLines(id || '');
  const { data: catalogItems } = useCatalogItems();
  const { data: suppliers } = useSuppliers();
  const { data: prices } = useSupplierPrices();
  
  const createLine = useCreateQuoteLine();
  const deleteLine = useDeleteQuoteLine();
  const updateQuote = useUpdateQuote();

  if (loadingQuote) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // useQuoteWithLines is an alias for useQuote which returns the full Quote object
  const quote = quoteData;
  const lines = quoteData?.lines || [];

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Cotação não encontrada</p>
        <Button variant="outline" onClick={() => navigate('/quotes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  // Calculate totals
  const calculateTotals = () => {
    let totalFOB = 0;
    let totalCBM = 0;
    let totalWeight = 0;

    for (const line of lines) {
      const catalogItem = catalogItems?.find(c => c.id === line.catalog_item_id);
      const price = prices?.find(p => 
        p.supplier_id === line.chosen_supplier_id && 
        p.catalog_item_id === line.catalog_item_id
      );
      
      const fobUnit = Number(line.override_price_fob_usd) || Number(price?.price_fob_usd) || 0;
      totalFOB += line.qty * fobUnit;
      totalCBM += line.qty * Number(catalogItem?.unit_cbm || 0);
      totalWeight += line.qty * Number(catalogItem?.unit_weight_kg || 0);
    }

    const containerCapacity = CONTAINER_CBM[quote.container_type];
    const containerQty = quote.container_qty_override || Math.ceil(totalCBM / containerCapacity);
    
    const freightTotal = containerQty * Number(quote.freight_per_container_usd);
    const insuranceTotal = (totalFOB + freightTotal) * Number(quote.insurance_rate);
    const cifTotal = totalFOB + freightTotal + insuranceTotal;
    
    const landedUS = cifTotal * (1 + DUTY_RATES.US) + Number(quote.fixed_costs_usd);
    const landedARStandard = cifTotal * (1 + DUTY_RATES.AR_STANDARD) + Number(quote.fixed_costs_usd);
    const landedARSimplified = cifTotal * (1 + DUTY_RATES.AR_SIMPLIFIED) + Number(quote.fixed_costs_usd);
    const landedBR = cifTotal * (1 + DUTY_RATES.BR) + Number(quote.fixed_costs_usd);

    return {
      totalFOB,
      totalCBM,
      totalWeight,
      containerQty,
      freightTotal,
      insuranceTotal,
      cifTotal,
      landedUS,
      landedARStandard,
      landedARSimplified,
      landedBR,
    };
  };

  const calc = calculateTotals();
  
  // Container utilization
  const containerCapacity = CONTAINER_CBM[quote.container_type];
  const utilization = calc.totalCBM > 0 
    ? (calc.totalCBM / (calc.containerQty * containerCapacity)) * 100 
    : 0;

  // Add line to quote
  const handleAddLine = async () => {
    await createLine.mutateAsync({
      quoteId: quote.id,
      line: {
        catalog_item_id: lineFormData.catalog_item_id,
        chosen_supplier_id: lineFormData.chosen_supplier_id,
        qty: lineFormData.qty,
        override_price_fob_usd: lineFormData.override_price_fob_usd 
          ? parseFloat(lineFormData.override_price_fob_usd) 
          : undefined,
      },
    });
    setShowAddLineDialog(false);
    setLineFormData({
      catalog_item_id: '',
      chosen_supplier_id: '',
      qty: 1,
      override_price_fob_usd: '',
    });
  };

  // Delete line
  const handleDeleteLine = async (lineId: string) => {
    await deleteLine.mutateAsync({ quoteId: quote.id, lineId });
  };

  // Update quote status
  const handleUpdateStatus = async (status: typeof quote.status) => {
    await updateQuote.mutateAsync({ id: quote.id, status });
  };

  // Get line details
  const getLineDetails = (line: typeof lines[0]) => {
    const catalogItem = catalogItems?.find(c => c.id === line.catalog_item_id);
    const supplier = suppliers?.find(s => s.id === line.chosen_supplier_id);
    const price = prices?.find(p => 
      p.supplier_id === line.chosen_supplier_id && 
      p.catalog_item_id === line.catalog_item_id
    );
    
    const fobUnit = Number(line.override_price_fob_usd) || Number(price?.price_fob_usd) || 0;
    const fobTotal = line.qty * fobUnit;
    const cbmTotal = line.qty * Number(catalogItem?.unit_cbm || 0);
    const weightTotal = line.qty * Number(catalogItem?.unit_weight_kg || 0);

    return { catalogItem, supplier, fobUnit, fobTotal, cbmTotal, weightTotal };
  };

  // Get prices for selected catalog item
  const getPricesForItem = (catalogItemId: string) => {
    return prices?.filter(p => p.catalog_item_id === catalogItemId) || [];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/quotes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{quote.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={quote.status} />
              <CountryBadge country={quote.destination_country} />
              <ContainerBadge type={quote.container_type} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && quote.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('pending')}>
              Enviar para Aprovação
            </Button>
          )}
          {isAdmin && quote.status === 'pending' && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('approved')}>
                Aprovar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('draft')}>
                Voltar para Rascunho
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Google Sheet
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Cost breakdown cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Package className="w-4 h-4" />
            <span className="text-xs uppercase">FOB Total</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.totalFOB)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {lines.length} item(s)
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Ship className="w-4 h-4" />
            <span className="text-xs uppercase">Frete</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.freightTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {calc.containerQty} × {formatCurrency(Number(quote.freight_per_container_usd))}/cont.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs uppercase">Seguro</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.insuranceTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(Number(quote.insurance_rate) * 100).toFixed(2)}% do FOB+Frete
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase">CIF Total</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.cifTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            FOB + Frete + Seguro
          </p>
        </div>
        
        <div className="bg-primary text-primary-foreground rounded-lg p-4">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Truck className="w-4 h-4" />
            <span className="text-xs uppercase">Landed {quote.destination_country}</span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(
              quote.destination_country === 'AR' 
                ? calc.landedARStandard 
                : quote.destination_country === 'BR' 
                  ? calc.landedBR 
                  : calc.landedUS
            )}
          </p>
          <p className="text-xs opacity-80 mt-1">
            + {formatCurrency(Number(quote.fixed_costs_usd))} custos fixos
          </p>
        </div>
      </div>

      {/* CBM and Container info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold mb-4">Logística / Contêineres</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">CBM Total</span>
              <span className="font-medium">{formatNumber(calc.totalCBM, 2)} m³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Peso Total</span>
              <span className="font-medium">{formatNumber(calc.totalWeight, 0)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tipo de Container</span>
              <ContainerBadge type={quote.container_type} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quantidade</span>
              <span className="font-bold text-lg">{calc.containerQty}</span>
            </div>
            
            {/* Utilization bar */}
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Utilização</span>
                <span className={utilization > 90 ? 'text-success' : utilization > 70 ? 'text-warning' : 'text-destructive'}>
                  {formatNumber(utilization, 1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    utilization > 90 ? 'bg-success' : utilization > 70 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Landed cost comparison */}
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold mb-4">Comparativo Landed por País</h3>
          
          <div className="space-y-3">
            {[
              { country: 'US', flag: '🇺🇸', name: 'Estados Unidos', value: calc.landedUS, rate: '30.1%' },
              { country: 'AR', flag: '🇦🇷', name: 'Argentina (General)', value: calc.landedARStandard, rate: '80.81%' },
              { country: 'AR', flag: '🇦🇷', name: 'Argentina (Simplif.)', value: calc.landedARSimplified, rate: '51%' },
              { country: 'BR', flag: '🇧🇷', name: 'Brasil', value: calc.landedBR, rate: '66.8%' },
            ].map((item, i) => (
              <div 
                key={i}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  quote.destination_country === item.country ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Taxa: {item.rate}</p>
                  </div>
                </div>
                <span className="font-bold">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Itens do Pedido</h3>
          {(quote.status === 'draft' || isAdmin) && (
            <Button size="sm" onClick={() => setShowAddLineDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          )}
        </div>
        
        {lines.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item adicionado ainda.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setShowAddLineDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fornecedor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Qtd</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">CBM</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Peso</th>
                  {(quote.status === 'draft' || isAdmin) && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {lines.map((line) => {
                  const details = getLineDetails(line);
                  
                  return (
                    <tr key={line.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{details.catalogItem?.name ?? 'Item desconhecido'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {details.catalogItem?.sku}
                            </span>
                            {details.catalogItem && (
                              <CategoryBadge category={details.catalogItem.category} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{details.supplier?.name ?? '-'}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {details.supplier?.lead_time_days} dias
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{line.qty}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(details.fobUnit)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(details.fobTotal)}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(details.cbmTotal, 2)} m³</td>
                      <td className="px-4 py-3 text-right text-sm">{formatNumber(details.weightTotal, 0)} kg</td>
                      {(quote.status === 'draft' || isAdmin) && (
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLine(line.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/30 border-t">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">Totais:</td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(calc.totalFOB)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatNumber(calc.totalCBM, 2)} m³</td>
                  <td className="px-4 py-3 text-right font-medium">{formatNumber(calc.totalWeight, 0)} kg</td>
                  {(quote.status === 'draft' || isAdmin) && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Calculation formulas reference */}
      <div className="bg-muted/30 rounded-lg border p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Fórmulas de Cálculo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><code className="bg-muted px-1 rounded">FOB</code> = qty × price_fob_usd</p>
            <p><code className="bg-muted px-1 rounded">FREIGHT</code> = cont_qty × freight_per_container</p>
            <p><code className="bg-muted px-1 rounded">INSURANCE</code> = (FOB + FREIGHT) × insurance_rate</p>
            <p><code className="bg-muted px-1 rounded">CIF</code> = FOB + FREIGHT + INSURANCE</p>
          </div>
          <div className="space-y-2">
            <p><code className="bg-muted px-1 rounded">LANDED_US</code> = CIF × 1.301 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_AR</code> = CIF × 1.8081 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_AR_SIMPL</code> = CIF × 1.51 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_BR</code> = CIF × 1.668 + fixed_costs</p>
          </div>
        </div>
      </div>

      {/* Add Line Dialog */}
      <Dialog open={showAddLineDialog} onOpenChange={setShowAddLineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
            <DialogDescription>
              Selecione um produto e fornecedor para adicionar ao pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select 
                value={lineFormData.catalog_item_id}
                onValueChange={(v) => setLineFormData(f => ({ ...f, catalog_item_id: v, chosen_supplier_id: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems?.filter(c => c.is_active).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
                        <span>{item.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Select 
                value={lineFormData.chosen_supplier_id}
                onValueChange={(v) => setLineFormData(f => ({ ...f, chosen_supplier_id: v }))}
                disabled={!lineFormData.catalog_item_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {lineFormData.catalog_item_id && getPricesForItem(lineFormData.catalog_item_id).map(price => {
                    const supplier = suppliers?.find(s => s.id === price.supplier_id);
                    return supplier ? (
                      <SelectItem key={price.id} value={supplier.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{supplier.name}</span>
                          <span className="font-medium">{formatCurrency(Number(price.price_fob_usd))}</span>
                        </div>
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
              {lineFormData.catalog_item_id && getPricesForItem(lineFormData.catalog_item_id).length === 0 && (
                <p className="text-sm text-destructive">Nenhum fornecedor com preço para este produto.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min={1}
                  value={lineFormData.qty}
                  onChange={(e) => setLineFormData(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Preço Override (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={lineFormData.override_price_fob_usd}
                  onChange={(e) => setLineFormData(f => ({ ...f, override_price_fob_usd: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLineDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddLine}
              disabled={
                !lineFormData.catalog_item_id || 
                !lineFormData.chosen_supplier_id || 
                createLine.isPending
              }
            >
              {createLine.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
