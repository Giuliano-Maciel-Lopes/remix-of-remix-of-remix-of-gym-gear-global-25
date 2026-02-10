/**
 * AI Service - Smart data analysis and recommendations
 * All read-only operations - never modifies data
 */

import prisma from '../../shared/prisma.js';

// Container capacities in CBM
const CONTAINER_CBM: Record<string, number> = {
  '20FT': 33,
  '40FT': 67,
  '40HC': 76,
};

// Tax/duty rates by destination
const DUTY_RATES: Record<string, { standard: number; simplified?: number }> = {
  US: { standard: 0.301 },
  AR: { standard: 0.8081, simplified: 0.51 },
  BR: { standard: 0.668 },
};

// Profile budget multipliers and item ranges
const PROFILE_CONFIG: Record<string, { minItems: number; maxItems: number; categoryWeights: Record<string, number> }> = {
  studio_pequeno: {
    minItems: 5, maxItems: 15,
    categoryWeights: { Cardio: 0.3, Strength: 0.3, Accessories: 0.2, Functional: 0.2 },
  },
  academia_media: {
    minItems: 15, maxItems: 40,
    categoryWeights: { Cardio: 0.25, Strength: 0.35, FreeWeights: 0.15, Benches: 0.1, Accessories: 0.1, Functional: 0.05 },
  },
  academia_grande: {
    minItems: 40, maxItems: 80,
    categoryWeights: { Cardio: 0.2, Strength: 0.3, FreeWeights: 0.15, Benches: 0.1, Accessories: 0.1, Functional: 0.15 },
  },
  cross_training: {
    minItems: 10, maxItems: 30,
    categoryWeights: { Functional: 0.35, FreeWeights: 0.25, Strength: 0.2, Accessories: 0.15, Cardio: 0.05 },
  },
};

// Category mapping for Prisma enum values
const CATEGORY_MAP: Record<string, string> = {
  Cardio: 'Cardio',
  Strength: 'Strength',
  FreeWeights: 'FreeWeights',
  Benches: 'Benches',
  Accessories: 'Accessories',
  Functional: 'Functional',
};

export class AIService {

  /**
   * Generate intelligent kit based on profile, budget, and destination
   */
  async generateKit(params: {
    profile: string;
    budget_usd: number;
    destination_country: string;
    area_m2?: number;
  }) {
    const config = PROFILE_CONFIG[params.profile] || PROFILE_CONFIG.academia_media;
    const dutyRate = DUTY_RATES[params.destination_country] || DUTY_RATES.BR;

    // Fetch active catalog items with their cheapest prices
    const catalogItems = await prisma.catalogItem.findMany({
      where: { isActive: true },
      include: {
        prices: {
          include: { supplier: true },
          orderBy: { priceFobUsd: 'asc' },
        },
      },
    });

    // Filter items that have at least one price
    const itemsWithPrices = catalogItems.filter(item => item.prices.length > 0);

    // Group by category
    const byCategory: Record<string, typeof itemsWithPrices> = {};
    for (const item of itemsWithPrices) {
      const cat = item.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    // Build kit respecting category weights and budget
    const kitLines: Array<{
      catalog_item_id: string;
      catalog_item_name: string;
      catalog_item_sku: string;
      category: string;
      supplier_id: string;
      supplier_name: string;
      qty: number;
      price_fob_usd: number;
      fob_total: number;
      unit_cbm: number;
      unit_weight_kg: number;
      cbm_total: number;
      weight_total: number;
    }> = [];

    let totalFob = 0;
    let totalCbm = 0;
    let totalWeight = 0;

    // Iterate category weights, pick cheapest items
    for (const [cat, weight] of Object.entries(config.categoryWeights)) {
      const categoryBudget = params.budget_usd * weight;
      const items = byCategory[cat] || [];
      if (items.length === 0) continue;

      // Sort by cheapest FOB
      items.sort((a, b) => a.prices[0].priceFobUsd - b.prices[0].priceFobUsd);

      let spent = 0;
      for (const item of items) {
        if (spent >= categoryBudget) break;
        const bestPrice = item.prices[0];
        const qty = Math.max(1, Math.floor(Math.min(
          (categoryBudget - spent) / bestPrice.priceFobUsd,
          params.area_m2 ? Math.ceil(params.area_m2 / 20) : 3
        )));
        if (qty <= 0) continue;

        const fobTotal = qty * bestPrice.priceFobUsd;
        const cbmTotal = qty * item.unitCbm;
        const weightTotal = qty * item.unitWeightKg;

        kitLines.push({
          catalog_item_id: item.id,
          catalog_item_name: item.name,
          catalog_item_sku: item.sku,
          category: item.category,
          supplier_id: bestPrice.supplierId,
          supplier_name: bestPrice.supplier.name,
          qty,
          price_fob_usd: bestPrice.priceFobUsd,
          fob_total: fobTotal,
          unit_cbm: item.unitCbm,
          unit_weight_kg: item.unitWeightKg,
          cbm_total: cbmTotal,
          weight_total: weightTotal,
        });

        spent += fobTotal;
        totalFob += fobTotal;
        totalCbm += cbmTotal;
        totalWeight += weightTotal;
      }
    }

    // Calculate logistics
    const recommendedContainer = totalCbm <= 33 ? '20FT' : totalCbm <= 67 ? '40FT' : '40HC';
    const containerCapacity = CONTAINER_CBM[recommendedContainer];
    const containerQty = Math.max(1, Math.ceil(totalCbm / containerCapacity));
    const freightPerContainer = 3500;
    const freightTotal = containerQty * freightPerContainer;
    const insuranceRate = 0.005;
    const insuranceTotal = (totalFob + freightTotal) * insuranceRate;
    const cifTotal = totalFob + freightTotal + insuranceTotal;
    const fixedCosts = 500;
    const landedTotal = cifTotal * (1 + dutyRate.standard) + fixedCosts;

    return {
      profile: params.profile,
      budget_usd: params.budget_usd,
      destination_country: params.destination_country,
      lines: kitLines,
      summary: {
        total_items: kitLines.reduce((s, l) => s + l.qty, 0),
        total_fob: totalFob,
        total_cbm: totalCbm,
        total_weight: totalWeight,
        container_type: recommendedContainer,
        container_qty: containerQty,
        freight_total: freightTotal,
        insurance_total: insuranceTotal,
        cif_total: cifTotal,
        fixed_costs: fixedCosts,
        landed_total: landedTotal,
        budget_utilization: (totalFob / params.budget_usd) * 100,
      },
    };
  }

  /**
   * Analyze prices for a product or category
   */
  async analyzePrices(params: { catalog_item_id?: string; category?: string }) {
    const where: any = {};
    if (params.catalog_item_id) where.catalogItemId = params.catalog_item_id;
    if (params.category) {
      where.catalogItem = { category: params.category as any };
    }

    const prices = await prisma.supplierPrice.findMany({
      where,
      include: {
        supplier: true,
        catalogItem: true,
      },
      orderBy: { priceFobUsd: 'asc' },
    });

    if (prices.length === 0) {
      return { message: 'Nenhum preço encontrado para os critérios informados.', analysis: null };
    }

    const fobValues = prices.map(p => p.priceFobUsd);
    const avg = fobValues.reduce((s, v) => s + v, 0) / fobValues.length;
    const min = Math.min(...fobValues);
    const max = Math.max(...fobValues);
    const stdDev = Math.sqrt(fobValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / fobValues.length);

    // Group by supplier
    const bySupplier: Record<string, { name: string; prices: number[]; avg: number }> = {};
    for (const p of prices) {
      if (!bySupplier[p.supplierId]) {
        bySupplier[p.supplierId] = { name: p.supplier.name, prices: [], avg: 0 };
      }
      bySupplier[p.supplierId].prices.push(p.priceFobUsd);
    }
    for (const s of Object.values(bySupplier)) {
      s.avg = s.prices.reduce((a, b) => a + b, 0) / s.prices.length;
    }

    // Outliers (> 1.5 std devs from mean)
    const outliers = prices
      .filter(p => Math.abs(p.priceFobUsd - avg) > 1.5 * stdDev)
      .map(p => ({
        supplier: p.supplier.name,
        item: p.catalogItem.name,
        price: p.priceFobUsd,
        deviation_pct: ((p.priceFobUsd - avg) / avg) * 100,
      }));

    const cheapestSupplier = Object.entries(bySupplier)
      .sort(([, a], [, b]) => a.avg - b.avg)[0];

    return {
      analysis: {
        total_prices: prices.length,
        avg_price: avg,
        min_price: min,
        max_price: max,
        std_dev: stdDev,
        cheapest_supplier: cheapestSupplier ? { id: cheapestSupplier[0], name: cheapestSupplier[1].name, avg_price: cheapestSupplier[1].avg } : null,
        suppliers: Object.entries(bySupplier).map(([id, data]) => ({
          id,
          name: data.name,
          avg_price: data.avg,
          price_count: data.prices.length,
          diff_from_avg_pct: ((data.avg - avg) / avg) * 100,
        })),
        outliers,
        alerts: outliers.map(o =>
          `Preço de ${o.supplier} para ${o.item} está ${o.deviation_pct > 0 ? o.deviation_pct.toFixed(1) + '% acima' : Math.abs(o.deviation_pct).toFixed(1) + '% abaixo'} da média.`
        ),
      },
    };
  }

  /**
   * Simulate scenarios for an existing quote
   */
  async simulateScenarios(params: { quote_id: string }) {
    const quote = await prisma.quote.findUnique({
      where: { id: params.quote_id },
      include: {
        lines: {
          include: {
            catalogItem: true,
            supplier: true,
          },
        },
        client: true,
      },
    });

    if (!quote) throw new Error('Cotação não encontrada');

    // Get prices for each line
    const lineDetails = await Promise.all(
      quote.lines.map(async (line) => {
        const price = await prisma.supplierPrice.findFirst({
          where: { supplierId: line.chosenSupplierId, catalogItemId: line.catalogItemId },
          orderBy: { priceFobUsd: 'asc' },
        });
        const priceFob = line.overridePriceFobUsd ?? price?.priceFobUsd ?? 0;
        return {
          qty: line.qty,
          price_fob: priceFob,
          fob_total: line.qty * priceFob,
          cbm_total: line.qty * line.catalogItem.unitCbm,
          weight_total: line.qty * line.catalogItem.unitWeightKg,
        };
      })
    );

    const baseFob = lineDetails.reduce((s, l) => s + l.fob_total, 0);
    const baseCbm = lineDetails.reduce((s, l) => s + l.cbm_total, 0);
    const baseWeight = lineDetails.reduce((s, l) => s + l.weight_total, 0);

    const containerType = quote.containerType === 'TWENTY_FT' ? '20FT' : quote.containerType === 'FORTY_FT' ? '40FT' : '40HC';
    const containerCap = CONTAINER_CBM[containerType];
    const containerQty = quote.containerQtyOverride ?? Math.max(1, Math.ceil(baseCbm / containerCap));

    function calcScenario(freightMult: number, insuranceMult: number, fobMult: number) {
      const fob = baseFob * fobMult;
      const freight = containerQty * quote.freightPerContainerUsd * freightMult;
      const insurance = (fob + freight) * quote.insuranceRate * insuranceMult;
      const cif = fob + freight + insurance;
      const dest = quote.destinationCountry as string;
      const rate = DUTY_RATES[dest] || DUTY_RATES.BR;
      const landed = cif * (1 + rate.standard) + quote.fixedCostsUsd;
      return { fob, freight, insurance, cif, landed };
    }

    return {
      quote_name: quote.name,
      base: calcScenario(1, 1, 1),
      optimistic: calcScenario(0.8, 0.95, 0.95),
      moderate: calcScenario(1, 1, 1),
      pessimistic: calcScenario(1.2, 1.05, 1.1),
      variables: {
        freight_variation: '±20%',
        insurance_variation: '±5%',
        fob_variation: '±10%',
      },
      logistics: {
        total_cbm: baseCbm,
        total_weight: baseWeight,
        container_type: containerType,
        container_qty: containerQty,
      },
    };
  }

  /**
   * Suggest HS Code based on product name and category
   */
  async suggestHsCode(params: { name: string; category: string; description?: string }) {
    // HS Code reference table for gym equipment
    const HS_CODES: Record<string, { code: string; description: string; confidence: number }[]> = {
      Cardio: [
        { code: '9506.91.00', description: 'Aparelhos para exercícios cardiovasculares', confidence: 85 },
        { code: '9506.99.00', description: 'Outros equipamentos para exercícios físicos', confidence: 70 },
      ],
      Strength: [
        { code: '9506.91.00', description: 'Aparelhos para musculação e fortalecimento', confidence: 90 },
        { code: '9506.99.00', description: 'Outros equipamentos de ginástica', confidence: 65 },
      ],
      'Free Weights': [
        { code: '9506.91.00', description: 'Halteres, pesos e barras', confidence: 92 },
        { code: '7326.90.90', description: 'Artefatos de ferro/aço (pesos soltos)', confidence: 60 },
      ],
      Benches: [
        { code: '9506.91.00', description: 'Bancos para exercícios', confidence: 88 },
        { code: '9401.80.00', description: 'Assentos especiais', confidence: 45 },
      ],
      Accessories: [
        { code: '9506.99.00', description: 'Acessórios para exercícios físicos', confidence: 80 },
        { code: '9506.91.00', description: 'Equipamentos auxiliares de ginástica', confidence: 70 },
      ],
      Functional: [
        { code: '9506.99.00', description: 'Equipamentos para treinamento funcional', confidence: 82 },
        { code: '9506.91.00', description: 'Aparelhos de exercícios diversos', confidence: 68 },
      ],
    };

    const suggestions = HS_CODES[params.category] || HS_CODES.Accessories;

    // Boost confidence if name contains key terms
    const boostedSuggestions = suggestions.map(s => {
      let confidence = s.confidence;
      const nameLower = params.name.toLowerCase();
      if (nameLower.includes('treadmill') || nameLower.includes('esteira')) confidence = Math.min(98, confidence + 5);
      if (nameLower.includes('dumbbell') || nameLower.includes('halter')) confidence = Math.min(98, confidence + 5);
      if (nameLower.includes('bike') || nameLower.includes('bicicleta')) confidence = Math.min(98, confidence + 5);
      return { ...s, confidence };
    });

    return {
      product: params.name,
      category: params.category,
      suggestions: boostedSuggestions.sort((a, b) => b.confidence - a.confidence),
    };
  }

  /**
   * Get system insights
   */
  async getInsights() {
    // Highest price increase items
    const allPrices = await prisma.supplierPrice.findMany({
      include: { catalogItem: true, supplier: true },
      orderBy: { validFrom: 'desc' },
    });

    // Group prices by catalog item
    const pricesByItem: Record<string, { name: string; prices: { fob: number; date: Date }[] }> = {};
    for (const p of allPrices) {
      if (!pricesByItem[p.catalogItemId]) {
        pricesByItem[p.catalogItemId] = { name: p.catalogItem.name, prices: [] };
      }
      pricesByItem[p.catalogItemId].prices.push({ fob: p.priceFobUsd, date: p.validFrom });
    }

    // Items with biggest price variations
    const priceVariations = Object.entries(pricesByItem)
      .filter(([, data]) => data.prices.length >= 2)
      .map(([id, data]) => {
        const sorted = data.prices.sort((a, b) => a.date.getTime() - b.date.getTime());
        const oldest = sorted[0].fob;
        const newest = sorted[sorted.length - 1].fob;
        const variation = ((newest - oldest) / oldest) * 100;
        return { catalog_item_id: id, name: data.name, variation, oldest_price: oldest, newest_price: newest };
      })
      .sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation))
      .slice(0, 10);

    // Most competitive suppliers (lowest avg price)
    const supplierAvgs: Record<string, { name: string; total: number; count: number }> = {};
    for (const p of allPrices) {
      if (!supplierAvgs[p.supplierId]) {
        supplierAvgs[p.supplierId] = { name: p.supplier.name, total: 0, count: 0 };
      }
      supplierAvgs[p.supplierId].total += p.priceFobUsd;
      supplierAvgs[p.supplierId].count++;
    }
    const competitiveSuppliers = Object.entries(supplierAvgs)
      .map(([id, data]) => ({ id, name: data.name, avg_price: data.total / data.count, price_count: data.count }))
      .sort((a, b) => a.avg_price - b.avg_price)
      .slice(0, 5);

    // Best landed cost items (cheapest FOB)
    const cheapestItems = [...allPrices]
      .sort((a, b) => a.priceFobUsd - b.priceFobUsd)
      .slice(0, 10)
      .map(p => ({
        item: p.catalogItem.name,
        supplier: p.supplier.name,
        price_fob: p.priceFobUsd,
      }));

    // Summary stats
    const totalCatalog = await prisma.catalogItem.count({ where: { isActive: true } });
    const totalSuppliers = await prisma.supplier.count({ where: { isActive: true } });
    const totalPrices = allPrices.length;
    const totalQuotes = await prisma.quote.count();

    return {
      summary: { totalCatalog, totalSuppliers, totalPrices, totalQuotes },
      price_variations: priceVariations,
      competitive_suppliers: competitiveSuppliers,
      cheapest_items: cheapestItems,
    };
  }

  /**
   * Plan import - generates a complete import plan
   */
  async planImport(params: {
    destination_country: string;
    budget_usd: number;
    operation_size: string; // small, medium, large
  }) {
    // Map operation size to a profile
    const profileMap: Record<string, string> = {
      small: 'studio_pequeno',
      medium: 'academia_media',
      large: 'academia_grande',
    };
    const profile = profileMap[params.operation_size] || 'academia_media';

    // Reuse kit generation
    const kit = await this.generateKit({
      profile,
      budget_usd: params.budget_usd,
      destination_country: params.destination_country,
    });

    // Add supplier country optimization
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      select: { id: true, name: true, country: true, leadTimeDays: true },
    });

    const supplierMap = new Map(suppliers.map(s => [s.id, s]));

    // Enrich lines with supplier details
    const enrichedLines = kit.lines.map(line => {
      const supplier = supplierMap.get(line.supplier_id);
      return {
        ...line,
        supplier_country: supplier?.country || 'CN',
        lead_time_days: supplier?.leadTimeDays || 45,
      };
    });

    const avgLeadTime = enrichedLines.length > 0
      ? enrichedLines.reduce((s, l) => s + l.lead_time_days, 0) / enrichedLines.length
      : 0;

    return {
      plan: {
        destination_country: params.destination_country,
        operation_size: params.operation_size,
        budget_usd: params.budget_usd,
      },
      lines: enrichedLines,
      summary: {
        ...kit.summary,
        avg_lead_time_days: Math.round(avgLeadTime),
        estimated_delivery_days: Math.round(avgLeadTime + 30), // +30 for shipping
      },
    };
  }
}

export const aiService = new AIService();
