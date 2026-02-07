/**
 * Quote Repository
 */

import prisma from '../../shared/prisma.js';
import type { CreateQuoteInput, UpdateQuoteInput, QuoteLineInput } from './quote.schemas.js';
import { ContainerType, DestinationCountry, QuoteStatus } from '@prisma/client';

const containerTypeMap: Record<string, ContainerType> = {
  '20FT': 'TWENTY_FT',
  '40FT': 'FORTY_FT',
  '40HC': 'FORTY_HC',
};

const containerTypeReverseMap: Record<ContainerType, string> = {
  'TWENTY_FT': '20FT',
  'FORTY_FT': '40FT',
  'FORTY_HC': '40HC',
};

export class QuoteRepository {
  async findAll() {
    return prisma.quote.findMany({
      include: {
        client: true,
        lines: {
          include: {
            catalogItem: true,
            supplier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        lines: {
          include: {
            catalogItem: true,
            supplier: true,
          },
        },
      },
    });
  }

  async create(data: CreateQuoteInput, userId?: string) {
    return prisma.quote.create({
      data: {
        name: data.name,
        clientId: data.client_id,
        createdBy: userId,
        status: (data.status as QuoteStatus) || 'draft',
        destinationCountry: (data.destination_country as DestinationCountry) || 'BR',
        containerType: containerTypeMap[data.container_type || '40HC'] || 'FORTY_HC',
        containerQtyOverride: data.container_qty_override,
        freightPerContainerUsd: data.freight_per_container_usd ?? 3500,
        insuranceRate: data.insurance_rate ?? 0.005,
        fixedCostsUsd: data.fixed_costs_usd ?? 500,
        notes: data.notes,
        lines: data.lines ? {
          create: data.lines.map(line => ({
            catalogItemId: line.catalog_item_id,
            chosenSupplierId: line.chosen_supplier_id,
            qty: line.qty,
            overridePriceFobUsd: line.override_price_fob_usd,
            notes: line.notes,
          })),
        } : undefined,
      },
      include: {
        client: true,
        lines: {
          include: {
            catalogItem: true,
            supplier: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateQuoteInput) {
    // If lines are provided, delete existing and recreate
    if (data.lines) {
      await prisma.quoteLine.deleteMany({ where: { quoteId: id } });
    }

    return prisma.quote.update({
      where: { id },
      data: {
        name: data.name,
        clientId: data.client_id,
        status: data.status as QuoteStatus,
        destinationCountry: data.destination_country as DestinationCountry,
        containerType: data.container_type ? containerTypeMap[data.container_type] : undefined,
        containerQtyOverride: data.container_qty_override,
        freightPerContainerUsd: data.freight_per_container_usd,
        insuranceRate: data.insurance_rate,
        fixedCostsUsd: data.fixed_costs_usd,
        notes: data.notes,
        lines: data.lines ? {
          create: data.lines.map(line => ({
            catalogItemId: line.catalog_item_id,
            chosenSupplierId: line.chosen_supplier_id,
            qty: line.qty,
            overridePriceFobUsd: line.override_price_fob_usd,
            notes: line.notes,
          })),
        } : undefined,
      },
      include: {
        client: true,
        lines: {
          include: {
            catalogItem: true,
            supplier: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.quote.delete({ where: { id } });
  }

  async addLine(quoteId: string, line: QuoteLineInput) {
    return prisma.quoteLine.create({
      data: {
        quoteId,
        catalogItemId: line.catalog_item_id,
        chosenSupplierId: line.chosen_supplier_id,
        qty: line.qty,
        overridePriceFobUsd: line.override_price_fob_usd,
        notes: line.notes,
      },
      include: {
        catalogItem: true,
        supplier: true,
      },
    });
  }

  async updateLine(lineId: string, line: Partial<QuoteLineInput>) {
    return prisma.quoteLine.update({
      where: { id: lineId },
      data: {
        catalogItemId: line.catalog_item_id,
        chosenSupplierId: line.chosen_supplier_id,
        qty: line.qty,
        overridePriceFobUsd: line.override_price_fob_usd,
        notes: line.notes,
      },
      include: {
        catalogItem: true,
        supplier: true,
      },
    });
  }

  async deleteLine(lineId: string) {
    return prisma.quoteLine.delete({ where: { id: lineId } });
  }
}

export const quoteRepository = new QuoteRepository();
