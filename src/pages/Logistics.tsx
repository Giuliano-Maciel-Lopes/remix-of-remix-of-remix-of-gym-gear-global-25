/**
 * Logistics Page
 * Container estimation, CBM calculations using Supabase data
 */

import React, { useState } from 'react';
import { 
  Container, 
  Package, 
  Ship, 
  Calculator,
  ArrowRight,
  RefreshCw,
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
import { ContainerBadge, CountryBadge } from '@/components/common/StatusBadge';
import { useQuotes } from '@/hooks/useApiQuery';
import { formatNumber, formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

// Container specifications
const containerSpecs = {
  '20FT': { cbm: 33, length: '6.06m', width: '2.44m', height: '2.59m', maxWeight: 28000 },
  '40FT': { cbm: 67, length: '12.03m', width: '2.44m', height: '2.59m', maxWeight: 28000 },
  '40HC': { cbm: 76, length: '12.03m', width: '2.44m', height: '2.89m', maxWeight: 28000 },
};

type ContainerType = '20FT' | '40FT' | '40HC';

export default function LogisticsPage() {
  // CBM Calculator state
  const [calcCBM, setCalcCBM] = useState<number>(0);
  const [selectedContainer, setSelectedContainer] = useState<ContainerType>('40HC');
  const [overrideQty, setOverrideQty] = useState<string>('');

  const { data: quotes, isLoading } = useQuotes();

  // Get active shipments from quotes
  const activeQuotes = quotes?.filter(q => q.status === 'approved' || q.status === 'ordered') || [];

  // Calculate container needs
  const containerCapacity = containerSpecs[selectedContainer].cbm;
  const estimatedContainers = Math.ceil(calcCBM / containerCapacity);
  const actualContainers = overrideQty ? parseInt(overrideQty) : estimatedContainers;
  const utilization = calcCBM > 0 ? (calcCBM / (actualContainers * containerCapacity)) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logística</h1>
        <p className="text-muted-foreground">
          Calculadora de contêineres e acompanhamento de embarques
        </p>
      </div>

      {/* Container specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(containerSpecs) as [ContainerType, typeof containerSpecs['20FT']][]).map(([type, specs]) => (
          <div 
            key={type}
            className={`bg-card rounded-lg border p-5 cursor-pointer transition-all ${
              selectedContainer === type 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedContainer(type)}
          >
            <div className="flex items-center justify-between mb-4">
              <ContainerBadge type={type} />
              <Container className={`w-8 h-8 ${
                type === '20FT' ? 'text-info' : type === '40FT' ? 'text-warning' : 'text-success'
              }`} />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacidade</span>
                <span className="font-bold">{specs.cbm} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensões</span>
                <span>{specs.length} × {specs.width}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Altura</span>
                <span>{specs.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso Máx.</span>
                <span>{formatNumber(specs.maxWeight, 0)} kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CBM Calculator */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Calculadora de Contêineres</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cbm">Volume Total (CBM)</Label>
              <div className="flex gap-2">
                <Input
                  id="cbm"
                  type="number"
                  placeholder="Ex: 150"
                  value={calcCBM || ''}
                  onChange={(e) => setCalcCBM(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
                <span className="flex items-center text-muted-foreground">m³</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="container">Tipo de Container</Label>
              <Select value={selectedContainer} onValueChange={(v) => setSelectedContainer(v as ContainerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20FT">Container 20' (33 m³)</SelectItem>
                  <SelectItem value="40FT">Container 40' (67 m³)</SelectItem>
                  <SelectItem value="40HC">Container 40'HC (76 m³)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="override">Override Manual (opcional)</Label>
              <Input
                id="override"
                type="number"
                placeholder="Quantidade de contêineres"
                value={overrideQty}
                onChange={(e) => setOverrideQty(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar o cálculo automático
              </p>
            </div>

            {overrideQty && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOverrideQty('')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar Override
              </Button>
            )}
          </div>

          {/* Results section */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              Resultado
              <ArrowRight className="w-4 h-4" />
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">CBM por Container</span>
                <span className="font-medium">{containerSpecs[selectedContainer].cbm} m³</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Cálculo Automático</span>
                <span className="font-medium">{estimatedContainers} container(s)</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Quantidade Final</span>
                <span className="text-2xl font-bold">{actualContainers}</span>
              </div>

              {/* Utilization bar */}
              {calcCBM > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Utilização</span>
                    <span className={
                      utilization > 90 ? 'text-success font-medium' : 
                      utilization > 70 ? 'text-warning font-medium' : 
                      'text-destructive font-medium'
                    }>
                      {formatNumber(utilization, 1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        utilization > 90 ? 'bg-success' : 
                        utilization > 70 ? 'bg-warning' : 
                        'bg-destructive'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Espaço livre: {formatNumber((actualContainers * containerCapacity) - calcCBM, 2)} m³
                  </p>
                </div>
              )}
            </div>

            {/* Formula explanation */}
            <div className="bg-background rounded p-3 text-xs space-y-1">
              <p className="font-medium flex items-center gap-1">
                <Info className="w-3 h-3" />
                Fórmula
              </p>
              <p className="font-mono text-muted-foreground">
                CONT_QTY = ceil(CBM_TOTAL / cap_cbm)
              </p>
              <p className="text-muted-foreground">
                = ceil({calcCBM} / {containerCapacity}) = {estimatedContainers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active shipments */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Embarques Ativos</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {activeQuotes.length} pedido(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Destino</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Container</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Frete/Cont.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum embarque ativo no momento
                  </td>
                </tr>
              ) : (
                activeQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{quote.name}</td>
                    <td className="px-4 py-3">
                      <CountryBadge country={quote.destination_country} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ContainerBadge type={quote.container_type} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(quote.freight_per_container_usd))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {new Date(quote.updated_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
