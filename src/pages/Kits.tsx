/**
 * Kits Preprontos Page
 * Generates recommended equipment kits based on store size and budget
 * Kit items are FOB only — CIF/Landed are calculated when a Quote is created
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Boxes,
  AlertTriangle,
  ArrowRight,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useGenerateKit, useCreateQuote, useAddQuoteLine, KitResult } from '@/hooks/useApiQuery';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export default function KitsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [storeSize, setStoreSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [budget, setBudget] = useState<number>(50000);
  const [kitResult, setKitResult] = useState<KitResult | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const generateKit = useGenerateKit();
  const createQuote = useCreateQuote();
  const addQuoteLine = useAddQuoteLine();

  const handleGenerate = async () => {
    const result = await generateKit.mutateAsync({
      store_size: storeSize,
      budget_usd: budget,
    });
    setKitResult(result);
  };

  const handleCreateOrder = async () => {
    if (!kitResult || kitResult.items.length === 0) return;

    setCreatingOrder(true);
    try {
      // Create a new draft quote
      const quote = await createQuote.mutateAsync({
        name: `Kit ${storeSize.charAt(0).toUpperCase() + storeSize.slice(1)} — ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'draft',
        destination_country: 'BR',
        container_type: '40HC',
        freight_per_container_usd: 3500,
        insurance_rate: 0.005,
        fixed_costs_usd: 500,
      });

      // Add each kit item as a quote line
      for (const item of kitResult.items) {
        await addQuoteLine.mutateAsync({
          quoteId: quote.id,
          line: {
            catalog_item_id: item.catalog_item_id,
            chosen_supplier_id: item.supplier_id,
            qty: item.qty,
            override_price_fob_usd: item.price_fob_usd,
          },
        });
      }

      toast({ title: 'Pedido criado com sucesso!' });
      navigate(`/quotes/${quote.id}`);
    } catch (error) {
      toast({ title: 'Erro ao criar pedido', variant: 'destructive' });
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Boxes className="w-7 h-7 text-primary" />
          Kits Preprontos
        </h1>
        <p className="text-muted-foreground">
          Monte kits de equipamentos com base no tamanho da loja e orçamento disponível
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Configurar Kit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tamanho da Loja</Label>
            <Select value={storeSize} onValueChange={(v) => setStoreSize(v as typeof storeSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequena (até 200 m²)</SelectItem>
                <SelectItem value="medium">Média (200–500 m²)</SelectItem>
                <SelectItem value="large">Grande (500+ m²)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Orçamento (USD)</Label>
            <Input
              type="number"
              min={1000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 1000)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={generateKit.isPending}
              className="w-full"
            >
              {generateKit.isPending ? 'Gerando...' : 'Gerar Kit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {generateKit.isPending && (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-64" />
        </div>
      )}

      {kitResult && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Itens no Kit</p>
              <p className="text-2xl font-bold">{kitResult.items.length}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">FOB Total</p>
              <p className="text-2xl font-bold">{formatCurrency(kitResult.total_fob)}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Orçamento</p>
              <p className="text-2xl font-bold">{formatCurrency(kitResult.budget_usd)}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${kitResult.budget_remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(kitResult.budget_remaining)}
              </p>
            </div>
          </div>

          {/* Warning about CIF/Landed */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Valores exibidos são apenas FOB</p>
              <p className="text-sm text-muted-foreground">
                Os custos de CIF e Landed Cost serão calculados automaticamente após criar o pedido.
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Itens Recomendados</h3>
              <Button
                onClick={handleCreateOrder}
                disabled={creatingOrder || kitResult.items.length === 0}
              >
                {creatingOrder ? (
                  'Criando pedido...'
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Criar Pedido com este Kit
                  </>
                )}
              </Button>
            </div>

            {kitResult.items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum item encontrado para este orçamento.</p>
                <p className="text-sm">Tente aumentar o orçamento ou verificar os preços cadastrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fornecedor</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Qtd</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">FOB Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {kitResult.items.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{item.catalog_item_name}</p>
                            <p className="text-xs font-mono text-muted-foreground">{item.catalog_item_sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.supplier_name}</td>
                        <td className="px-4 py-3 text-right font-medium">{item.qty}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(item.price_fob_usd)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.fob_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-right font-medium">Total FOB:</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(kitResult.total_fob)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
