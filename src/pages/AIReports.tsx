/**
 * AI Reports Page - Main container with sub-tabs
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, TrendingUp, BarChart3, Tag, Globe, Eye } from 'lucide-react';
import KitGenerator from '@/components/ai/KitGenerator';
import PriceAnalysis from '@/components/ai/PriceAnalysis';
import ScenarioSimulator from '@/components/ai/ScenarioSimulator';
import HsSuggestion from '@/components/ai/HsSuggestion';
import InsightsDashboard from '@/components/ai/InsightsDashboard';
import ImportPlanner from '@/components/ai/ImportPlanner';

export default function AIReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          IA & Relatórios Inteligentes
        </h1>
        <p className="text-muted-foreground mt-1">
          Análises inteligentes, kits automáticos e simulações — somente leitura, sem alteração de dados.
        </p>
      </div>

      <Tabs defaultValue="kits" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="kits" className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Kits
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Preços
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Cenários
          </TabsTrigger>
          <TabsTrigger value="hscode" className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> HS Code
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Insights
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Planejamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kits"><KitGenerator /></TabsContent>
        <TabsContent value="prices"><PriceAnalysis /></TabsContent>
        <TabsContent value="scenarios"><ScenarioSimulator /></TabsContent>
        <TabsContent value="hscode"><HsSuggestion /></TabsContent>
        <TabsContent value="insights"><InsightsDashboard /></TabsContent>
        <TabsContent value="planner"><ImportPlanner /></TabsContent>
      </Tabs>
    </div>
  );
}
