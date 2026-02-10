/**
 * Kit Generator - AI-powered kit builder based on gym profile, budget, and destination
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiApi, KitResult } from '@/lib/aiApi';
import { quotesApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, ShoppingCart, Sparkles } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export default function KitGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<KitResult | null>(null);
  const [form, setForm] = useState({
    profile: 'academia_media',
    budget_usd: 50000,
    destination_country: 'BR',
    area_m2: 200,
  });

  const profiles = [
    { value: 'studio_pequeno', label: 'Studio Pequeno' },
    { value: 'academia_media', label: 'Academia Média' },
    { value: 'academia_grande', label: 'Academia Grande' },
    { value: 'cross_training', label: 'Cross Training' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await aiApi.generateKit(form);
      setResult(data);
      toast({ title: 'Kit gerado com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro ao gerar kit', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!result || result.lines.length === 0) return;
    setCreating(true);
    try {
      await quotesApi.create({
        name: `Kit ${profiles.find(p => p.value === result.profile)?.label || result.profile} - ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'pending',
        destination_country: result.destination_country as any,
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
      toast({ title: 'Pedido criado com status pendente para aprovação!' });
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
            <Sparkles className="w-5 h-5 text-accent" />
            Gerador de Kits Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Perfil da Academia</Label>
              <Select value={form.profile} onValueChange={v => setForm(f => ({ ...f, profile: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orçamento (USD)</Label>
              <Input
                type="number"
                value={form.budget_usd}
                onChange={e => setForm(f => ({ ...f, budget_usd: Number(e.target.value) }))}
                min={1000}
              />
            </div>
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
              <Label>Área da Loja (m²)</Label>
              <Input
                type="number"
                value={form.area_m2}
                onChange={e => setForm(f => ({ ...f, area_m2: Number(e.target.value) }))}
                min={10}
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Gerar Kit Inteligente
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Itens', value: result.summary.total_items },
              { label: 'FOB Total', value: formatCurrency(result.summary.total_fob) },
              { label: 'CIF Total', value: formatCurrency(result.summary.cif_total) },
              { label: 'Landed Total', value: formatCurrency(result.summary.landed_total) },
              { label: 'CBM Total', value: formatNumber(result.summary.total_cbm) + ' m³' },
              { label: 'Container', value: `${result.summary.container_qty}x ${result.summary.container_type}` },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Kit Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Itens do Kit ({result.lines.length})
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
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">FOB Unit.</TableHead>
                    <TableHead className="text-right">FOB Total</TableHead>
                    <TableHead className="text-right">CBM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.lines.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{line.catalog_item_name}</TableCell>
                      <TableCell><Badge variant="outline">{line.category}</Badge></TableCell>
                      <TableCell>{line.supplier_name}</TableCell>
                      <TableCell className="text-right">{line.qty}</TableCell>
                      <TableCell className="text-right">{formatCurrency(line.price_fob_usd)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(line.fob_total)}</TableCell>
                      <TableCell className="text-right">{formatNumber(line.cbm_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Budget Utilization */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utilização do Orçamento</span>
                <span className="text-sm font-bold">{formatNumber(result.summary.budget_utilization, 1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, result.summary.budget_utilization)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
