/**
 * Scenario Simulator - Simulate optimistic/moderate/pessimistic scenarios for quotes
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiApi, ScenarioResult } from '@/lib/aiApi';
import { useQuotes } from '@/hooks/useApiQuery';
import { Loader2, BarChart3, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export default function ScenarioSimulator() {
  const { toast } = useToast();
  const { data: quotes } = useQuotes();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [quoteId, setQuoteId] = useState('');

  const handleSimulate = async () => {
    if (!quoteId) {
      toast({ title: 'Selecione uma cotação', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const data = await aiApi.simulate({ quote_id: quoteId });
      setResult(data);
      toast({ title: 'Simulação concluída!' });
    } catch (error: any) {
      toast({ title: 'Erro na simulação', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const scenarios = result ? [
    { key: 'optimistic', label: 'Otimista', icon: TrendingDown, data: result.optimistic, color: 'text-success' },
    { key: 'moderate', label: 'Moderado', icon: Minus, data: result.moderate, color: 'text-muted-foreground' },
    { key: 'pessimistic', label: 'Pessimista', icon: TrendingUp, data: result.pessimistic, color: 'text-destructive' },
  ] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Simulação de Cenários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cotação</Label>
              <Select value={quoteId} onValueChange={setQuoteId}>
                <SelectTrigger><SelectValue placeholder="Selecione uma cotação..." /></SelectTrigger>
                <SelectContent>
                  {(quotes || []).map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.name} ({q.status})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSimulate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                Simular Cenários
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Cenários: {result.quote_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cenário</TableHead>
                    <TableHead className="text-right">FOB</TableHead>
                    <TableHead className="text-right">Frete</TableHead>
                    <TableHead className="text-right">Seguro</TableHead>
                    <TableHead className="text-right">CIF</TableHead>
                    <TableHead className="text-right">Landed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map(s => {
                    const Icon = s.icon;
                    return (
                      <TableRow key={s.key}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${s.color}`} />
                            <span className="font-medium">{s.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(s.data.fob)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.data.freight)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.data.insurance)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.data.cif)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(s.data.landed)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Variables Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Variáveis Aplicadas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <Badge variant="outline">{result.variables.freight_variation}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seguro</span>
                  <Badge variant="outline">{result.variables.insurance_variation}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">FOB</span>
                  <Badge variant="outline">{result.variables.fob_variation}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Logística</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CBM Total</span>
                  <span className="font-medium">{formatNumber(result.logistics.total_cbm)} m³</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peso Total</span>
                  <span className="font-medium">{formatNumber(result.logistics.total_weight)} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Container</span>
                  <span className="font-medium">{result.logistics.container_qty}x {result.logistics.container_type}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difference highlight */}
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Diferença entre cenários (Landed)</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(result.pessimistic.landed - result.optimistic.landed)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({formatNumber(((result.pessimistic.landed - result.optimistic.landed) / result.moderate.landed) * 100, 1)}% de variação)
                </span>
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
