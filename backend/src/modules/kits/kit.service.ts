/**
 * Kit Service
 * Generates recommended kits based on store size and budget
 * Returns only items + quantities (no CIF/Landed — those come from Quotes)
 */

import prisma from "../../shared/prisma.js";
import { AppError } from "../../shared/middleware/errorHandler.js";

interface KitInput {
  store_size: "small" | "medium" | "large";
  budget_usd: number;
}

// Category distribution by store size (how many items per category)
const STORE_PROFILES: Record<string, Record<string, { min: number; max: number }>> = {
  small: {
    Cardio: { min: 2, max: 4 },
    Strength: { min: 2, max: 4 },
    "Free Weights": { min: 1, max: 2 },
    Benches: { min: 1, max: 2 },
    Accessories: { min: 1, max: 3 },
    Functional: { min: 0, max: 2 },
  },
  medium: {
    Cardio: { min: 4, max: 8 },
    Strength: { min: 4, max: 8 },
    "Free Weights": { min: 2, max: 4 },
    Benches: { min: 2, max: 4 },
    Accessories: { min: 2, max: 5 },
    Functional: { min: 1, max: 3 },
  },
  large: {
    Cardio: { min: 8, max: 15 },
    Strength: { min: 8, max: 15 },
    "Free Weights": { min: 4, max: 8 },
    Benches: { min: 3, max: 6 },
    Accessories: { min: 3, max: 8 },
    Functional: { min: 2, max: 5 },
  },
};

interface KitItem {
  catalog_item_id: string;
  catalog_item_name: string;
  catalog_item_sku: string;
  category: string;
  qty: number;
  supplier_id: string;
  supplier_name: string;
  price_fob_usd: number;
  fob_total: number;
}

interface KitResult {
  store_size: string;
  budget_usd: number;
  total_fob: number;
  budget_remaining: number;
  items: KitItem[];
}

export class KitService {
  async generate(input: KitInput): Promise<KitResult> {
    const profile = STORE_PROFILES[input.store_size];
    if (!profile) throw new AppError(400, "Tamanho de loja inválido");

    // Get all active catalog items with their best prices
    const catalogItems = await prisma.catalogItem.findMany({
      where: { isActive: true },
      include: {
        prices: {
          include: { supplier: true },
          orderBy: { priceFobUsd: "asc" },
        },
      },
    });

    // Group by category
    const byCategory: Record<string, typeof catalogItems> = {};
    for (const item of catalogItems) {
      const cat = item.category.toString();
      // Map enum values to display names
      const catName = cat === "FreeWeights" ? "Free Weights" : cat;
      if (!byCategory[catName]) byCategory[catName] = [];
      byCategory[catName].push(item);
    }

    const kitItems: KitItem[] = [];
    let totalFob = 0;

    // For each category, pick items up to the min quantity within budget
    for (const [category, limits] of Object.entries(profile)) {
      const items = byCategory[category] || [];
      if (items.length === 0) continue;

      let categoryCount = 0;

      for (const item of items) {
        if (categoryCount >= limits.max) break;

        // Get best price (cheapest supplier)
        const bestPrice = item.prices.find(p => p.supplier.isActive);
        if (!bestPrice) continue;

        const qty = Math.max(1, limits.min - categoryCount);
        const fobTotal = qty * bestPrice.priceFobUsd;

        // Check budget
        if (totalFob + fobTotal > input.budget_usd) {
          // Try with qty=1
          if (totalFob + bestPrice.priceFobUsd <= input.budget_usd && categoryCount < limits.min) {
            kitItems.push({
              catalog_item_id: item.id,
              catalog_item_name: item.name,
              catalog_item_sku: item.sku,
              category,
              qty: 1,
              supplier_id: bestPrice.supplier.id,
              supplier_name: bestPrice.supplier.name,
              price_fob_usd: bestPrice.priceFobUsd,
              fob_total: bestPrice.priceFobUsd,
            });
            totalFob += bestPrice.priceFobUsd;
            categoryCount += 1;
          }
          continue;
        }

        kitItems.push({
          catalog_item_id: item.id,
          catalog_item_name: item.name,
          catalog_item_sku: item.sku,
          category,
          qty,
          supplier_id: bestPrice.supplier.id,
          supplier_name: bestPrice.supplier.name,
          price_fob_usd: bestPrice.priceFobUsd,
          fob_total: fobTotal,
        });
        totalFob += fobTotal;
        categoryCount += qty;
      }
    }

    return {
      store_size: input.store_size,
      budget_usd: input.budget_usd,
      total_fob: totalFob,
      budget_remaining: input.budget_usd - totalFob,
      items: kitItems,
    };
  }
}

export const kitService = new KitService();
