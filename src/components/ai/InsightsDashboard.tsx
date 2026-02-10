/**
 * Insights Dashboard - System-wide intelligence overview
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiApi, InsightsResult } from '@/lib/aiApi';
import { Loader2, Brain, TrendingUp, TrendingDown, Award, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export default function InsightsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightsResult | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await aiApi.getInsights();
      setData(result);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar insights', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Produtos Ativos', value: data.summary.totalCatalog, icon: '📦' },
          { label: 'Fornecedores Ativos', value: data.summary.totalSuppliers, icon: '🏭' },
          { label: 'Preços Cadastrados', value: data.summary.totalPrices, icon: '💰' },
          { label: 'Cotações', value: data.summary.totalQuotes, icon: '📋' },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Variations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Maiores Variações de Preço
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.price_variations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados suficientes para análise de variação.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">Antigo</TableHead>
                    <TableHead className="text-right">Atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.price_variations.map(pv => (
                    <TableRow key={pv.catalog_item_id}>
                      <TableCell className="font-medium text-xs">{pv.name}</TableCell>
                      <TableCell className="text-right">
                        <span className={pv.variation > 0 ? 'text-destructive' : 'text-success'}>
                          {pv.variation > 0 ? '+' : ''}{formatNumber(pv.variation, 1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(pv.oldest_price)}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(pv.newest_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Most Competitive Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4" />
              Fornecedores Mais Competitivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.competitive_suppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados de fornecedores.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Preço Médio</TableHead>
                    <TableHead className="text-right">Preços</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.competitive_suppliers.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {i === 0 ? <Badge className="bg-warning text-warning-foreground">🏆</Badge> : i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.avg_price)}</TableCell>
                      <TableCell className="text-right">{s.price_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cheapest Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4" />
            Produtos com Menor Custo FOB
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.cheapest_items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem dados de preços.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">FOB USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cheapest_items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(item.price_fob)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" onClick={load} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        Atualizar Insights
      </Button>
    </div>
  );
}
