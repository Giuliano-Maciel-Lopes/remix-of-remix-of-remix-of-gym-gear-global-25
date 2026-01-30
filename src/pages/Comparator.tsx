/**
 * Import Comparator Page
 * Core feature for comparing landed costs across countries and suppliers
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Globe, 
  Package,
  Building2,
  Clock,
  DollarSign,
  Ship,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useCatalogItems, 
  useSuppliers, 
  useSupplierPrices,
  CatalogItem,
  Supplier,
  SupplierPrice
} from '@/hooks/useSupabaseQuery';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

// Duty rates by destination
const DUTY_RATES = {
  US: { name: 'Estados Unidos', flag: '🇺🇸', rate: 0.301, label: '30.1%' },
  AR_STANDARD: { name: 'Argentina (Caixa)', flag: '🇦🇷', rate: 0.8081, label: '80.81%' },
  AR_SIMPLIFIED: { name: 'Argentina (Simplif.)', flag: '🇦🇷', rate: 0.51, label: '51%' },
  BR: { name: 'Brasil', flag: '🇧🇷', rate: 0.668, label: '66.8%' },
};

// Container specs
const CONTAINERS = {
  '20FT': { cbm: 33, label: "Container 20'" },
  '40FT': { cbm: 67, label: "Container 40'" },
  '40HC': { cbm: 76, label: "Container 40'HC" },
};

interface ComparisonResult {
  supplier: Supplier;
  price: SupplierPrice;
  fobTotal: number;
  cbmTotal: number;
  weightTotal: number;
  freightTotal: number;
  insuranceTotal: number;
  cifTotal: number;
  landedUS: number;
  landedARStandard: number;
  landedARSimplified: number;
  landedBR: number;
  containerQty: number;
  isBestFOB: boolean;
}

export default function ComparatorPage() {
  // State
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [containerType, setContainerType] = useState<'20FT' | '40FT' | '40HC'>('40HC');
  const [freightPerContainer, setFreightPerContainer] = useState<number>(3500);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.005);
  const [fixedCosts, setFixedCosts] = useState<number>(500);

  // Data fetching
  const { data: catalogItems, isLoading: loadingCatalog } = useCatalogItems();
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { data: prices, isLoading: loadingPrices } = useSupplierPrices();

  const isLoading = loadingCatalog || loadingSuppliers || loadingPrices;

  // Get selected catalog item
  const selectedCatalogItem = useMemo(() => 
    catalogItems?.find(c => c.id === selectedItem),
    [catalogItems, selectedItem]
  );

  // Calculate comparison for each supplier with prices for the selected item
  const comparisons = useMemo(() => {
    if (!selectedCatalogItem || !suppliers || !prices) return [];

    const itemPrices = prices.filter(p => p.catalog_item_id === selectedItem);
    
    const results: ComparisonResult[] = [];
    
    for (const price of itemPrices) {
      const supplier = suppliers.find(s => s.id === price.supplier_id);
      if (!supplier || !supplier.is_active) continue;

      // FOB calculations
      const fobTotal = quantity * Number(price.price_fob_usd);
      const cbmTotal = quantity * Number(selectedCatalogItem.unit_cbm);
      const weightTotal = quantity * Number(selectedCatalogItem.unit_weight_kg);

      // Container calculation
      const containerCapacity = CONTAINERS[containerType].cbm;
      const containerQty = Math.ceil(cbmTotal / containerCapacity);

      // Freight and insurance
      const freightTotal = containerQty * freightPerContainer;
      const insuranceTotal = (fobTotal + freightTotal) * insuranceRate;
      const cifTotal = fobTotal + freightTotal + insuranceTotal;

      // Landed costs
      const landedUS = cifTotal * (1 + DUTY_RATES.US.rate) + fixedCosts;
      const landedARStandard = cifTotal * (1 + DUTY_RATES.AR_STANDARD.rate) + fixedCosts;
      const landedARSimplified = cifTotal * (1 + DUTY_RATES.AR_SIMPLIFIED.rate) + fixedCosts;
      const landedBR = cifTotal * (1 + DUTY_RATES.BR.rate) + fixedCosts;

      results.push({
        supplier,
        price,
        fobTotal,
        cbmTotal,
        weightTotal,
        freightTotal,
        insuranceTotal,
        cifTotal,
        landedUS,
        landedARStandard,
        landedARSimplified,
        landedBR,
        containerQty,
        isBestFOB: false,
      });
    }

    // Mark best FOB price
    if (results.length > 0) {
      const minFOB = Math.min(...results.map(r => r.fobTotal));
      results.forEach(r => {
        r.isBestFOB = r.fobTotal === minFOB;
      });
    }

    // Sort by FOB total
    return results.sort((a, b) => a.fobTotal - b.fobTotal);
  }, [selectedCatalogItem, selectedItem, suppliers, prices, quantity, containerType, freightPerContainer, insuranceRate, fixedCosts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-7 h-7 text-primary" />
          Comparador de Importação
        </h1>
        <p className="text-muted-foreground">
          Compare custos FOB, CIF e Landed por fornecedor e país de destino
        </p>
      </div>

      {/* Configuration panel */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Configurar Comparação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product selector */}
          <div className="space-y-2 lg:col-span-2">
            <Label>Produto</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
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

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>

          {/* Container type */}
          <div className="space-y-2">
            <Label>Tipo de Container</Label>
            <Select value={containerType} onValueChange={(v) => setContainerType(v as typeof containerType)}>
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

          {/* Freight per container */}
          <div className="space-y-2">
            <Label>Frete/Container (USD)</Label>
            <Input
              type="number"
              value={freightPerContainer}
              onChange={(e) => setFreightPerContainer(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Insurance rate */}
          <div className="space-y-2">
            <Label>Taxa de Seguro (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={insuranceRate * 100}
              onChange={(e) => setInsuranceRate((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>

          {/* Fixed costs */}
          <div className="space-y-2">
            <Label>Custos Fixos (USD)</Label>
            <Input
              type="number"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Product info */}
      {selectedCatalogItem && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">CBM Unitário</p>
            <p className="text-xl font-bold">{formatNumber(Number(selectedCatalogItem.unit_cbm), 2)} m³</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Peso Unitário</p>
            <p className="text-xl font-bold">{formatNumber(Number(selectedCatalogItem.unit_weight_kg), 1)} kg</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">CBM Total</p>
            <p className="text-xl font-bold">
              {formatNumber(quantity * Number(selectedCatalogItem.unit_cbm), 2)} m³
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Peso Total</p>
            <p className="text-xl font-bold">
              {formatNumber(quantity * Number(selectedCatalogItem.unit_weight_kg), 0)} kg
            </p>
          </div>
        </div>
      )}

      {/* Comparison results */}
      {selectedItem && comparisons.length > 0 ? (
        <div className="space-y-6">
          {/* Supplier comparison table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Comparativo por Fornecedor
              </h3>
              <Badge variant="secondary">{comparisons.length} fornecedores</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fornecedor</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Lead Time</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">CIF Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">🇺🇸 Landed US</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">🇦🇷 Landed AR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">🇧🇷 Landed BR</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Containers</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparisons.map((comp, i) => (
                    <tr 
                      key={comp.supplier.id} 
                      className={`hover:bg-muted/30 ${comp.isBestFOB ? 'bg-success/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {comp.isBestFOB && (
                            <Badge className="bg-success text-success-foreground">Melhor</Badge>
                          )}
                          <div>
                            <p className="font-medium">{comp.supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{comp.supplier.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{comp.supplier.lead_time_days}</span>
                          <span className="text-xs text-muted-foreground">dias</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(Number(comp.price.price_fob_usd))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(comp.fobTotal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(comp.cifTotal)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-info">
                        {formatCurrency(comp.landedUS)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-warning">
                        {formatCurrency(comp.landedARSimplified)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-success">
                        {formatCurrency(comp.landedBR)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{comp.containerQty}× {containerType}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Country comparison for best supplier */}
          {comparisons[0] && (
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Custo Landed por País (Melhor Fornecedor: {comparisons[0].supplier.name})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(DUTY_RATES).map(([key, dest]) => {
                  const landed = key === 'US' 
                    ? comparisons[0].landedUS 
                    : key === 'AR_STANDARD' 
                      ? comparisons[0].landedARStandard
                      : key === 'AR_SIMPLIFIED'
                        ? comparisons[0].landedARSimplified
                        : comparisons[0].landedBR;

                  return (
                    <div 
                      key={key}
                      className="bg-muted/30 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{dest.flag}</span>
                        <Badge variant="secondary">{dest.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{dest.name}</p>
                      <p className="text-2xl font-bold">{formatCurrency(landed)}</p>
                      <p className="text-xs text-muted-foreground">
                        CIF × {(1 + dest.rate).toFixed(4)} + {formatCurrency(fixedCosts)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : selectedItem ? (
        <div className="bg-muted/30 rounded-lg border p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum preço encontrado</p>
          <p className="text-muted-foreground">
            Não há preços cadastrados para este produto. Adicione preços na seção de fornecedores.
          </p>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg border p-8 text-center">
          <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Selecione um produto</p>
          <p className="text-muted-foreground">
            Escolha um produto acima para ver a comparação de custos entre fornecedores e países.
          </p>
        </div>
      )}

      {/* Formulas reference */}
      <div className="bg-muted/30 rounded-lg border p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Fórmulas de Cálculo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="space-y-2">
            <p><code className="bg-muted px-1 rounded">FOB</code> = qty × price_fob_usd</p>
            <p><code className="bg-muted px-1 rounded">FREIGHT</code> = cont_qty × freight_per_container</p>
            <p><code className="bg-muted px-1 rounded">INSURANCE</code> = (FOB + FREIGHT) × insurance_rate</p>
            <p><code className="bg-muted px-1 rounded">CIF</code> = FOB + FREIGHT + INSURANCE</p>
          </div>
          <div className="space-y-2">
            <p><code className="bg-muted px-1 rounded">LANDED_US</code> = CIF × 1.301 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_AR_CAIXA</code> = CIF × 1.8081 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_AR_SIMPL</code> = CIF × 1.51 + fixed_costs</p>
            <p><code className="bg-muted px-1 rounded">LANDED_BR</code> = CIF × 1.668 + fixed_costs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
