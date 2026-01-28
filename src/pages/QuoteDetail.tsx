/**
 * Quote Detail Page
 * Shows complete quote breakdown with calculations
 * Includes supplier comparison and landed cost analysis
 */

import React from 'react';
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, CountryBadge, ContainerBadge, CategoryBadge } from '@/components/common/StatusBadge';
import { 
  quotes, 
  getSupplierById, 
  getCatalogItemById,
  getSupplierPrice,
  getPricesForCatalogItem 
} from '@/data/mockData';
import { 
  formatCurrency, 
  formatNumber, 
  calculateQuote, 
  percentDifference,
  containerUtilization 
} from '@/lib/calculations';
import type { Quote, QuoteLine } from '@/types';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the quote
  const quote = quotes.find(q => q.id === id);

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

  // Calculate quote totals
  const calc = calculateQuote(quote);

  // Get line item details
  const getLineDetails = (line: QuoteLine) => {
    const catalogItem = getCatalogItemById(line.catalog_item_id);
    const supplier = getSupplierById(line.chosen_supplier_id);
    const price = getSupplierPrice(line.chosen_supplier_id, line.catalog_item_id);
    const allPrices = getPricesForCatalogItem(line.catalog_item_id);
    
    const fobUnit = line.override_price_fob_usd ?? price?.price_fob_usd ?? 0;
    const fobTotal = line.qty * fobUnit;
    const cbmTotal = line.qty * (catalogItem?.unit_cbm ?? 0);
    const weightTotal = line.qty * (catalogItem?.unit_weight_kg ?? 0);
    
    // Find best price for comparison
    const bestPrice = Math.min(...allPrices.map(p => p.price_fob_usd));
    const priceDiff = percentDifference(fobUnit, bestPrice);
    
    return {
      catalogItem,
      supplier,
      fobUnit,
      fobTotal,
      cbmTotal,
      weightTotal,
      priceDiff,
      isBestPrice: fobUnit === bestPrice,
    };
  };

  // Container utilization
  const utilization = containerUtilization(calc.total_cbm, quote.container_type);

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
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
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
          <p className="text-2xl font-bold">{formatCurrency(calc.total_fob)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {quote.lines.length} item(s) × {quote.lines.reduce((s, l) => s + l.qty, 0)} unid.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Ship className="w-4 h-4" />
            <span className="text-xs uppercase">Frete</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.freight_total)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {calc.container_qty} × {formatCurrency(quote.freight_per_container_usd)}/cont.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs uppercase">Seguro</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.insurance_total)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(quote.insurance_rate * 100).toFixed(2)}% do FOB+Frete
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase">CIF Total</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(calc.cif_total)}</p>
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
                ? calc.landed_ar_standard 
                : quote.destination_country === 'BR' 
                  ? calc.landed_br 
                  : calc.landed_us
            )}
          </p>
          <p className="text-xs opacity-80 mt-1">
            + {formatCurrency(quote.fixed_costs_usd)} custos fixos
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
              <span className="font-medium">{formatNumber(calc.total_cbm, 2)} m³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Peso Total</span>
              <span className="font-medium">{formatNumber(calc.total_weight, 0)} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tipo de Container</span>
              <ContainerBadge type={quote.container_type} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quantidade</span>
              <span className="font-bold text-lg">{calc.container_qty}</span>
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
              { country: 'US', flag: '🇺🇸', name: 'Estados Unidos', value: calc.landed_us, rate: '30.1%' },
              { country: 'AR', flag: '🇦🇷', name: 'Argentina (General)', value: calc.landed_ar_standard, rate: '80.81%' },
              { country: 'AR', flag: '🇦🇷', name: 'Argentina (Simplif.)', value: calc.landed_ar_simplified, rate: '51%' },
              { country: 'BR', flag: '🇧🇷', name: 'Brasil', value: calc.landed_br, rate: '66.8%' },
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
        <div className="p-4 border-b">
          <h3 className="font-semibold">Itens do Pedido</h3>
        </div>
        
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
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Comparativo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quote.lines.map((line) => {
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
                    <td className="px-4 py-3 text-center">
                      {details.isBestPrice ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                          Melhor preço
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
                          +{formatNumber(details.priceDiff, 1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/30 border-t">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-medium">Totais:</td>
                <td className="px-4 py-3 text-right font-bold">{formatCurrency(calc.total_fob)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatNumber(calc.total_cbm, 2)} m³</td>
                <td className="px-4 py-3 text-right font-medium">{formatNumber(calc.total_weight, 0)} kg</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
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
    </div>
  );
}
