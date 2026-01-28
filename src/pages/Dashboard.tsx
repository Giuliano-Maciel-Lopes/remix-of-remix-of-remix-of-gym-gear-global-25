/**
 * Dashboard Page
 * Main overview with stats, charts, and alerts
 * Shows key metrics for the gym equipment trading business
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Building2, 
  Package, 
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Container
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { StatsCard, AlertCard } from '@/components/dashboard/StatsCard';
import { formatCurrency } from '@/lib/calculations';
import { 
  quotes, 
  suppliers, 
  catalogItems, 
  skuMappings,
  getActiveSuppliers,
  getPendingMappings
} from '@/data/mockData';

// Chart colors from design system
const CHART_COLORS = {
  primary: 'hsl(222, 47%, 20%)',
  accent: 'hsl(217, 91%, 60%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 16%, 47%)',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Calculate stats from mock data
  const activeSuppliers = getActiveSuppliers();
  const pendingMappings = getPendingMappings();
  const activeItems = catalogItems.filter(c => c.is_active);
  
  // Calculate total FOB value from all quotes
  const totalFOB = quotes.reduce((sum, quote) => {
    const quoteFOB = quote.lines.reduce((lineSum, line) => {
      // Mock price lookup
      return lineSum + (line.qty * 1500); // Simplified for demo
    }, 0);
    return sum + quoteFOB;
  }, 0);

  // Calculate average lead time
  const avgLeadTime = Math.round(
    activeSuppliers.reduce((sum, s) => sum + s.lead_time_days, 0) / activeSuppliers.length
  );

  // Data for FOB by destination chart
  const fobByDestination = [
    { country: 'Brasil', fob: 185000, landed: 308380, flag: '🇧🇷' },
    { country: 'Argentina', fob: 142000, landed: 256742, flag: '🇦🇷' },
    { country: 'EUA', fob: 89500, landed: 116439, flag: '🇺🇸' },
  ];

  // Data for supplier ranking
  const supplierRanking = [
    { name: 'Guangzhou Elite', value: 35, color: CHART_COLORS.primary },
    { name: 'Shandong Fitness', value: 28, color: CHART_COLORS.accent },
    { name: 'Ningbo Iron', value: 22, color: CHART_COLORS.success },
    { name: 'Zhejiang Pro', value: 15, color: CHART_COLORS.warning },
  ];

  // Monthly trend data
  const monthlyTrend = [
    { month: 'Set', fob: 145000, orders: 4 },
    { month: 'Out', fob: 168000, orders: 5 },
    { month: 'Nov', fob: 192000, orders: 6 },
    { month: 'Dez', fob: 210000, orders: 7 },
    { month: 'Jan', fob: 235000, orders: 8 },
    { month: 'Fev', fob: 258000, orders: 6 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de trading</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Pedidos"
          value={quotes.length}
          subtitle="2 pendentes de aprovação"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Fornecedores Ativos"
          value={activeSuppliers.length}
          subtitle={`${suppliers.length} cadastrados no total`}
          icon={Building2}
          variant="info"
        />
        <StatsCard
          title="SKUs no Catálogo"
          value={activeItems.length}
          subtitle="Equipamentos de academia"
          icon={Package}
        />
        <StatsCard
          title="Valor FOB Total"
          value={formatCurrency(totalFOB)}
          subtitle="Últimos 30 dias"
          icon={DollarSign}
          variant="success"
          trend={{ value: 8.5, isPositive: true }}
        />
      </div>

      {/* Alerts section */}
      {pendingMappings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlertCard
            title="SKU Mapping Pendente"
            message="Existem códigos de fornecedor sem mapeamento no catálogo"
            count={pendingMappings.length}
            onClick={() => navigate('/sku-mapping')}
          />
          <AlertCard
            title="Cotações em Rascunho"
            message="Finalize as cotações para continuar o processo"
            count={quotes.filter(q => q.status === 'draft').length}
            onClick={() => navigate('/quotes')}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FOB vs Landed by Destination */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">FOB vs Landed por Destino</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fobByDestination} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="country" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="fob" name="FOB" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="landed" name="Landed" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier distribution */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Fornecedor</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={supplierRanking}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {supplierRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly trend chart */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução Mensal de FOB</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => 
                name === 'fob' ? formatCurrency(value) : value
              }
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="fob" 
              name="Valor FOB"
              stroke={CHART_COLORS.primary} 
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              name="Pedidos"
              stroke={CHART_COLORS.accent} 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: CHART_COLORS.accent, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lead Time Médio</p>
            <p className="text-xl font-bold">{avgLeadTime} dias</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
            <Container className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contêineres este mês</p>
            <p className="text-xl font-bold">4 × 40HC</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-xl font-bold">78%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
