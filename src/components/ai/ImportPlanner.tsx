/**
 * Import Planner - AI-powered import planning tool
 * 
 * RULE: This component NEVER displays CIF, Landed, or estimated financial totals.
 * It only shows item suggestions with per-line FOB.
 * Full cost calculations appear only after creating a Quote (Pedido).
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { aiApi, ImportPlanResult } from '@/lib/aiApi';
import { quotesApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Globe, ShoppingCart, Truck, Sparkles, Info } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export default function ImportPlanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<ImportPlanResult | null>(null);
  const [form, setForm] = useState({
    destination_country: 'BR',
    budget_usd: 100000,
    operation_size: 'medium',
  });

  const sizes = [
    { value: 'small', label: 'Pequena (Studio)' },
    { value: 'medium', label: 'Média (Academia)' },
    { value: 'large', label: 'Grande (Academia/Rede)' },
  ];

  const handlePlan = async () => {
    setLoading(true);
    try {
      const data = await aiApi.planImport(form);
      setResult(data);
      toast({ title: 'Plano gerado com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro ao gerar plano', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!result || result.lines.length === 0) return;
    setCreating(true);
    try {
      await quotesApi.create({
        name: `Plano Importação ${form.destination_country} - ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'pending',
        destination_country: result.plan.destination_country as any,
        container_type: result.summary.container_type as any,
        freight_per_container_usd: 3500,
        insurance_rate: 0.005,
        fixed_costs_usd: 500,
        lines: result.lines.map(l => ({
          catalog_item_id: l.catalog_item_id,
          chosen_supplier_id: l.supplier_id,
          qty: l.qty,
          override_price_fob_usd: l.price_fob_usd,
        })),
      });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Pedido criado com status pendente! Acesse a aba Pedidos para ver os custos calculados.' });
    } catch (error: any) {
      toast({ title: 'Erro ao criar pedido', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Planejamento Inteligente de Importação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>País de Destino</Label>
              <Select value={form.destination_country} onValueChange={v => setForm(f => ({ ...f, destination_country: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">Brasil</SelectItem>
                  <SelectItem value="AR">Argentina</SelectItem>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orçamento (USD)</Label>
              <Input
                type="number"
                value={form.budget_usd}
                onChange={e => setForm(f => ({ ...f, budget_usd: Number(e.target.value) }))}
                min={5000}
              />
            </div>
            <div className="space-y-2">
              <Label>Tamanho da Operação</Label>
              <Select value={form.operation_size} onValueChange={v => setForm(f => ({ ...f, operation_size: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sizes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handlePlan} disabled={loading} className="mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Gerar Plano Inteligente
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Cards — Only FOB, CBM, Weight, Container (NO CIF/Landed) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'FOB Total', value: formatCurrency(result.summary.total_fob) },
              { label: 'CBM', value: formatNumber(result.summary.total_cbm) + ' m³' },
              { label: 'Peso', value: formatNumber(result.summary.total_weight) + ' kg' },
              { label: 'Container', value: `${result.summary.container_qty}x ${result.summary.container_type}` },
              { label: 'Lead Time Médio', value: `${result.summary.avg_lead_time_days} dias` },
              { label: 'Prazo Est.', value: `${result.summary.estimated_delivery_days} dias` },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info: CIF/Landed only available after creating Quote */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Os custos CIF e Landed serão calculados automaticamente ao criar o Pedido.
              Clique em "Criar Pedido Pendente" para ver os valores completos na aba Pedidos.
            </AlertDescription>
          </Alert>

          {/* Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Itens do Plano ({result.lines.length})
              </CardTitle>
              <Button onClick={handleCreateQuote} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                Criar Pedido Pendente
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">FOB Unit.</TableHead>
                    <TableHead className="text-right">FOB Total</TableHead>
                    <TableHead className="text-right">Lead Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.lines.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{line.catalog_item_name}</TableCell>
                      <TableCell><Badge variant="outline">{line.category}</Badge></TableCell>
                      <TableCell>{line.supplier_name}</TableCell>
                      <TableCell><Badge variant="secondary">{line.supplier_country}</Badge></TableCell>
                      <TableCell className="text-right">{line.qty}</TableCell>
                      <TableCell className="text-right">{formatCurrency(line.price_fob_usd)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(line.fob_total)}</TableCell>
                      <TableCell className="text-right">{line.lead_time_days}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
