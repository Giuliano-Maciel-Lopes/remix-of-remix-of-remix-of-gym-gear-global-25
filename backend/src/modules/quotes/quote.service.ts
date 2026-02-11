/**
 * Quote Service with Landed Cost Calculations
 */

import { quoteRepository } from "./quote.repository.js";
import { supplierPriceRepository } from "../supplier_prices/supplierPrice.repository.js";
import { AppError } from "../../shared/middleware/errorHandler.js";
import { CONTAINER_CBM, DUTY_RATES } from "../../shared/types.js";
import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteLineInput,
} from "./quote.schemas.js";
import prisma from "../../shared/prisma.js";

// Container capacities in CBM
const CONTAINER_CAPACITY: Record<string, number> = {
  TWENTY_FT: 33,
  FORTY_FT: 67,
  FORTY_HC: 76,
  "20FT": 33,
  "40FT": 67,
  "40HC": 76,
};

const containerTypeReverseMap: Record<string, string> = {
  TWENTY_FT: "20FT",
  FORTY_FT: "40FT",
  FORTY_HC: "40HC",
};

interface LineCalculation {
  catalog_item_id: string;
  catalog_item_name: string;
  supplier_id: string;
  supplier_name: string;
  qty: number;
  price_fob_usd: number;
  fob_total: number;
  cbm_total: number;
  weight_total: number;
}

interface QuoteCalculation {
  total_fob: number;
  total_cbm: number;
  total_weight: number;
  container_qty: number;
  freight_total: number;
  insurance_total: number;
  cif_total: number;
  landed_us: number;
  landed_ar_standard: number;
  landed_ar_simplified: number;
  landed_br: number;
  lines: LineCalculation[];
}

interface CompareInput {
  catalog_item_id: string;
  qty: number;
  container_type: string;
  freight_per_container_usd: number;
  insurance_rate: number;
  fixed_costs_usd: number;
}

interface CompareResult {
  supplier_id: string;
  supplier_name: string;
  supplier_country: string;
  lead_time_days: number;
  price_fob_usd: number;
  fob_total: number;
  cbm_total: number;
  weight_total: number;
  freight_total: number;
  insurance_total: number;
  cif_total: number;
  landed_us: number;
  landed_ar_standard: number;
  landed_ar_simplified: number;
  landed_br: number;
  container_qty: number;
  is_best_fob: boolean;
}

export class QuoteService {
  async getAll() {
    const quotes = await quoteRepository.findAll();

    return quotes.map((q) => this.formatQuote(q));
  }

  async getById(id: string) {
    const quote = await quoteRepository.findById(id);

    if (!quote) {
      throw new AppError(404, "Cotação não encontrada");
    }

    return this.formatQuoteWithCalculations(quote);
  }

  async create(input: CreateQuoteInput, userId?: string) {
    const quote = await quoteRepository.create(input, userId);
    return this.formatQuoteWithCalculations(quote);
  }

  async update(id: string, input: UpdateQuoteInput) {
    const existing = await quoteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cotação não encontrada");

    const quote = await quoteRepository.update(id, input);
    return this.formatQuoteWithCalculations(quote);
  }

  async delete(id: string) {
    const existing = await quoteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cotação não encontrada");

    await quoteRepository.delete(id);
    return { success: true };
  }

  async addLine(quoteId: string, line: QuoteLineInput) {
    const quote = await quoteRepository.findById(quoteId);
    if (!quote) throw new AppError(404, "Cotação não encontrada");

    await quoteRepository.addLine(quoteId, line);

    // Return updated quote with calculations
    const updatedQuote = await quoteRepository.findById(quoteId);
    return this.formatQuoteWithCalculations(updatedQuote!);
  }

  async updateLine(
    quoteId: string,
    lineId: string,
    line: Partial<QuoteLineInput>,
  ) {
    await quoteRepository.updateLine(lineId, line);

    const updatedQuote = await quoteRepository.findById(quoteId);
    return this.formatQuoteWithCalculations(updatedQuote!);
  }

  async deleteLine(quoteId: string, lineId: string) {
    await quoteRepository.deleteLine(lineId);

    const updatedQuote = await quoteRepository.findById(quoteId);
    return this.formatQuoteWithCalculations(updatedQuote!);
  }

  /**
   * Compare suppliers for a given catalog item
   * Uses the same calculation logic as calculateQuote
   */
  async compare(input: CompareInput): Promise<CompareResult[]> {
    // Find the catalog item
    const catalogItem = await prisma.catalogItem.findUnique({
      where: { id: input.catalog_item_id },
    });
    if (!catalogItem) throw new AppError(404, "Item de catálogo não encontrado");

    // Find all supplier prices for this item
    const supplierPrices = await prisma.supplierPrice.findMany({
      where: { catalogItemId: input.catalog_item_id },
      include: { supplier: true },
    });

    // Filter active suppliers only
    const activePrices = supplierPrices.filter(sp => sp.supplier.isActive);
    if (activePrices.length === 0) return [];

    const containerCapacity = CONTAINER_CAPACITY[input.container_type] || 76;

    const results: CompareResult[] = activePrices.map(sp => {
      const priceFob = sp.priceFobUsd;
      const fobTotal = input.qty * priceFob;
      const cbmTotal = input.qty * catalogItem.unitCbm;
      const weightTotal = input.qty * catalogItem.unitWeightKg;

      const containerQty = Math.max(1, Math.ceil(cbmTotal / containerCapacity));
      const freightTotal = containerQty * input.freight_per_container_usd;
      const insuranceTotal = (fobTotal + freightTotal) * input.insurance_rate;
      const cifTotal = fobTotal + freightTotal + insuranceTotal;

      const landedUs = cifTotal * (1 + DUTY_RATES.US.standard) + input.fixed_costs_usd;
      const landedArStandard = cifTotal * (1 + DUTY_RATES.AR.standard) + input.fixed_costs_usd;
      const landedArSimplified = cifTotal * (1 + DUTY_RATES.AR.simplified) + input.fixed_costs_usd;
      const landedBr = cifTotal * (1 + DUTY_RATES.BR.standard) + input.fixed_costs_usd;

      return {
        supplier_id: sp.supplier.id,
        supplier_name: sp.supplier.name,
        supplier_country: sp.supplier.country,
        lead_time_days: sp.supplier.leadTimeDays,
        price_fob_usd: priceFob,
        fob_total: fobTotal,
        cbm_total: cbmTotal,
        weight_total: weightTotal,
        freight_total: freightTotal,
        insurance_total: insuranceTotal,
        cif_total: cifTotal,
        landed_us: landedUs,
        landed_ar_standard: landedArStandard,
        landed_ar_simplified: landedArSimplified,
        landed_br: landedBr,
        container_qty: containerQty,
        is_best_fob: false,
      };
    });

    // Sort by FOB and mark best
    results.sort((a, b) => a.fob_total - b.fob_total);
    if (results.length > 0) {
      const minFob = results[0].fob_total;
      results.forEach(r => { r.is_best_fob = r.fob_total === minFob; });
    }

    return results;
  }

  private formatQuote(quote: any) {
    return {
      id: quote.id,
      name: quote.name,
      client_id: quote.clientId,
      client: quote.client
        ? {
            id: quote.client.id,
            name: quote.client.name,
          }
        : null,
      status: quote.status,
      destination_country: quote.destinationCountry,
      container_type:
        containerTypeReverseMap[quote.containerType] || quote.containerType,
      container_qty_override: quote.containerQtyOverride,
      freight_per_container_usd: quote.freightPerContainerUsd,
      insurance_rate: quote.insuranceRate,
      fixed_costs_usd: quote.fixedCostsUsd,
      notes: quote.notes,
      created_at: quote.createdAt.toISOString(),
      updated_at: quote.updatedAt.toISOString(),
      lines:
        quote.lines?.map((l: any) => ({
          id: l.id,
          catalog_item_id: l.catalogItemId,
          catalog_item: l.catalogItem
            ? {
                id: l.catalogItem.id,
                sku: l.catalogItem.sku,
                name: l.catalogItem.name,
                unit_cbm: l.catalogItem.unitCbm,
                unit_weight_kg: l.catalogItem.unitWeightKg,
              }
            : null,
          chosen_supplier_id: l.chosenSupplierId,
          supplier: l.supplier
            ? {
                id: l.supplier.id,
                name: l.supplier.name,
              }
            : null,
          qty: l.qty,
          override_price_fob_usd: l.overridePriceFobUsd,
          notes: l.notes,
        })) || [],
    };
  }

  private async formatQuoteWithCalculations(quote: any) {
    const formattedQuote = this.formatQuote(quote);
    const calculations = await this.calculateQuote(quote);

    return {
      ...formattedQuote,
      calculations,
    };
  }

  private async calculateQuote(quote: any): Promise<QuoteCalculation> {
    const lines: LineCalculation[] = [];

    for (const line of quote.lines || []) {
      // Get price from override or lookup
      let priceFobUsd = line.overridePriceFobUsd;

      if (!priceFobUsd) {
        const supplierPrice =
          await supplierPriceRepository.findBySupplierAndItem(
            line.chosenSupplierId,
            line.catalogItemId,
          );
        priceFobUsd = supplierPrice?.priceFobUsd || 0;
      }

      const catalogItem = line.catalogItem;
      const supplier = line.supplier;

      lines.push({
        catalog_item_id: line.catalogItemId,
        catalog_item_name: catalogItem?.name || "",
        supplier_id: line.chosenSupplierId,
        supplier_name: supplier?.name || "",
        qty: line.qty,
        price_fob_usd: priceFobUsd,
        fob_total: line.qty * priceFobUsd,
        cbm_total: line.qty * (catalogItem?.unitCbm || 0),
        weight_total: line.qty * (catalogItem?.unitWeightKg || 0),
      });
    }

    // Sum up line totals
    const total_fob = lines.reduce((sum, l) => sum + l.fob_total, 0);
    const total_cbm = lines.reduce((sum, l) => sum + l.cbm_total, 0);
    const total_weight = lines.reduce((sum, l) => sum + l.weight_total, 0);

    // Container calculation
    const containerCapacity = CONTAINER_CAPACITY[quote.containerType] || 76;

    const calculatedContainers = Math.ceil(total_cbm / containerCapacity);

    const container_qty =
      quote.containerQtyOverride ??
      (calculatedContainers > 0 ? calculatedContainers : 1);

    // Freight and insurance
    const freight_total = container_qty * quote.freightPerContainerUsd;
    const insurance_total = (total_fob + freight_total) * quote.insuranceRate;
    const cif_total = total_fob + freight_total + insurance_total;

    // Landed costs by destination
    const usRate = DUTY_RATES.US.standard;
    const arStandardRate = DUTY_RATES.AR.standard;
    const arSimplifiedRate = DUTY_RATES.AR.simplified;
    const brRate = DUTY_RATES.BR.standard;

    const landed_us = cif_total * (1 + usRate) + quote.fixedCostsUsd;
    const landed_ar_standard =
      cif_total * (1 + arStandardRate) + quote.fixedCostsUsd;
    const landed_ar_simplified =
      cif_total * (1 + arSimplifiedRate) + quote.fixedCostsUsd;
    const landed_br = cif_total * (1 + brRate) + quote.fixedCostsUsd;

    return {
      total_fob,
      total_cbm,
      total_weight,
      container_qty,
      freight_total,
      insurance_total,
      cif_total,
      landed_us,
      landed_ar_standard,
      landed_ar_simplified,
      landed_br,
      lines,
    };
  }
}

export const quoteService = new QuoteService();
