/**
 * SKU Mapping Repository
 */

import prisma from '../../shared/prisma.js';
import type { CreateSkuMappingInput, UpdateSkuMappingInput } from './skuMapping.schemas.js';

export class SkuMappingRepository {
  async findAll() {
    return prisma.skuMapping.findMany({
      include: {
        supplier: true,
        catalogItem: true,
      },
      orderBy: { supplierModelCode: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.skuMapping.findUnique({
      where: { id },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async create(data: CreateSkuMappingInput) {
    return prisma.skuMapping.create({
      data: {
        supplierId: data.supplier_id,
        supplierModelCode: data.supplier_model_code,
        catalogItemId: data.catalog_item_id,
        notes: data.notes,
      },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async update(id: string, data: UpdateSkuMappingInput) {
    return prisma.skuMapping.update({
      where: { id },
      data: {
        supplierId: data.supplier_id,
        supplierModelCode: data.supplier_model_code,
        catalogItemId: data.catalog_item_id,
        notes: data.notes,
      },
      include: {
        supplier: true,
        catalogItem: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.skuMapping.delete({ where: { id } });
  }
}

export const skuMappingRepository = new SkuMappingRepository();
