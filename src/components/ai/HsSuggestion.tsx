/**
 * HS Code Suggestion - suggests HS/NCM codes for catalog items
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
import { aiApi, HsCodeResult } from '@/lib/aiApi';
import { useCatalogItems } from '@/hooks/useApiQuery';
import { Loader2, Search, Tag } from 'lucide-react';

const CATEGORIES = ['Cardio', 'Strength', 'Free Weights', 'Benches', 'Accessories', 'Functional'];

export default function HsSuggestion() {
  const { toast } = useToast();
  const { data: catalogItems } = useCatalogItems();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HsCodeResult | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('Cardio');
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog');

  const activeItems = (catalogItems || []).filter(i => i.is_active);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      let name: string, category: string, description: string | undefined;
      if (mode === 'catalog') {
        const item = activeItems.find(i => i.id === selectedItemId);
        if (!item) { toast({ title: 'Selecione um item', variant: 'destructive' }); setLoading(false); return; }
        name = item.name;
        category = item.category;
        description = item.description || undefined;
      } else {
        if (!manualName) { toast({ title: 'Informe o nome do produto', variant: 'destructive' }); setLoading(false); return; }
        name = manualName;
        category = manualCategory;
      }
      const data = await aiApi.suggestHsCode({ name, category, description });
      setResult(data);
      toast({ title: 'Sugestão gerada!' });
    } catch (error: any) {
      toast({ title: 'Erro ao sugerir', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = (c: number) => {
    if (c >= 85) return 'bg-success text-success-foreground';
    if (c >= 70) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            Sugestão de HS Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Modo</Label>
              <Select value={mode} onValueChange={v => setMode(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="catalog">Do Catálogo</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === 'catalog' ? (
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {activeItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Nome do Produto</Label>
                  <Input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Ex: Esteira Elétrica" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={manualCategory} onValueChange={setManualCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex items-end">
              <Button onClick={handleSuggest} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Sugerir HS Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Sugestões para: <span className="text-accent">{result.product}</span> ({result.category})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">⚠️ Sugestões automáticas — confirme com despachante aduaneiro antes de usar.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HS Code</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Confiança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.suggestions.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-bold">{s.code}</TableCell>
                    <TableCell>{s.description}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={confidenceColor(s.confidence)}>{s.confidence}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
