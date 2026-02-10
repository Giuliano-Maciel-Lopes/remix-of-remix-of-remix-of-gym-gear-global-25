/**
 * Price Analysis - AI-powered price intelligence
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { aiApi, PriceAnalysisResult } from '@/lib/aiApi';
import { useCatalogItems } from '@/hooks/useApiQuery';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

const CATEGORIES = ['Cardio', 'Strength', 'Free Weights', 'Benches', 'Accessories', 'Functional'];

export default function PriceAnalysis() {
  const { toast } = useToast();
  const { data: catalogItems } = useCatalogItems();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceAnalysisResult | null>(null);
  const [filterType, setFilterType] = useState<'item' | 'category'>('category');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await aiApi.analyzePrices({
        catalog_item_id: filterType === 'item' ? selectedItem : undefined,
        category: filterType === 'category' ? selectedCategory : undefined,
      });
      setResult(data);
      toast({ title: 'Análise concluída!' });
    } catch (error: any) {
      toast({ title: 'Erro na análise', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const activeItems = (catalogItems || []).filter(i => i.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Análise de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filtrar por</Label>
              <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="item">Produto Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterType === 'category' ? (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {activeItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Analisar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result?.analysis && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Preços', value: result.analysis.total_prices },
              { label: 'Média', value: formatCurrency(result.analysis.avg_price) },
              { label: 'Mínimo', value: formatCurrency(result.analysis.min_price) },
              { label: 'Máximo', value: formatCurrency(result.analysis.max_price) },
              { label: 'Desvio Padrão', value: formatCurrency(result.analysis.std_dev) },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cheapest Supplier */}
          {result.analysis.cheapest_supplier && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Badge className="bg-success text-success-foreground">Melhor Preço</Badge>
                <span className="font-medium">{result.analysis.cheapest_supplier.name}</span>
                <span className="text-muted-foreground">—</span>
                <span className="font-bold">{formatCurrency(result.analysis.cheapest_supplier.avg_price)} (média)</span>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {result.analysis.alerts.length > 0 && (
            <div className="space-y-2">
              {result.analysis.alerts.map((alert, i) => (
                <Alert key={i} variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{alert}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Suppliers Table */}
          <Card>
            <CardHeader><CardTitle>Comparativo por Fornecedor</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Preço Médio</TableHead>
                    <TableHead className="text-right">Qtd Preços</TableHead>
                    <TableHead className="text-right">Vs. Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.analysis.suppliers.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.avg_price)}</TableCell>
                      <TableCell className="text-right">{s.price_count}</TableCell>
                      <TableCell className="text-right">
                        <span className={s.diff_from_avg_pct > 0 ? 'text-destructive' : 'text-success'}>
                          {s.diff_from_avg_pct > 0 ? '+' : ''}{formatNumber(s.diff_from_avg_pct, 1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {result && !result.analysis && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {result.message || 'Nenhum dado encontrado para análise.'}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
