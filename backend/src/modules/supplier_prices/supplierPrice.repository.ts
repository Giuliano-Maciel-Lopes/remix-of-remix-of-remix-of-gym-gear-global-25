/**
 * Supplier Price Repository
 */

import prisma from '../../shared/prisma.js';
import type { CreateSupplierPriceInput, UpdateSupplierPriceInput } from './supplierPrice.schemas.js';

export class SupplierPriceRepository {
  async findAll() {
    return prisma.supplierPrice.findMany({
      include: {
        supplier: true,
        catalogItem: true,
      },
      orderBy: { validFrom: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.supplierPrice.findUnique({
      where: { id },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async findBySupplierAndItem(supplierId: string, catalogItemId: string) {
    return prisma.supplierPrice.findFirst({
      where: {
        supplierId,
        catalogItemId,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { validFrom: 'desc' },
    });
  }

  async create(data: CreateSupplierPriceInput) {
    return prisma.supplierPrice.create({
      data: {
        supplierId: data.supplier_id,
        catalogItemId: data.catalog_item_id,
        priceFobUsd: data.price_fob_usd,
        currencyOriginal: data.currency_original || 'USD',
        priceOriginal: data.price_original,
        validFrom: data.valid_from ? new Date(data.valid_from) : new Date(),
        validUntil: data.valid_until ? new Date(data.valid_until) : null,
        moq: data.moq,
      },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async update(id: string, data: UpdateSupplierPriceInput) {
    return prisma.supplierPrice.update({
      where: { id },
      data: {
        supplierId: data.supplier_id,
        catalogItemId: data.catalog_item_id,
        priceFobUsd: data.price_fob_usd,
        currencyOriginal: data.currency_original,
        priceOriginal: data.price_original,
        validFrom: data.valid_from ? new Date(data.valid_from) : undefined,
        validUntil: data.valid_until ? new Date(data.valid_until) : undefined,
        moq: data.moq,
      },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.supplierPrice.delete({ where: { id } });
  }
}

export const supplierPriceRepository = new SupplierPriceRepository();
