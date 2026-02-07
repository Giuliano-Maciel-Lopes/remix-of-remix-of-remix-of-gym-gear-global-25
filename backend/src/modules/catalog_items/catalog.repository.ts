/**
 * Catalog Item Repository
 */

import prisma from '../../shared/prisma.js';
import type { CreateCatalogItemInput, UpdateCatalogItemInput } from './catalog.schemas.js';
import { EquipmentCategory } from '@prisma/client';

const categoryMap: Record<string, EquipmentCategory> = {
  'Cardio': 'Cardio',
  'Strength': 'Strength',
  'Free Weights': 'FreeWeights',
  'Benches': 'Benches',
  'Accessories': 'Accessories',
  'Functional': 'Functional',
};

export class CatalogRepository {
  async findAll(includeInactive = false) {
    return prisma.catalogItem.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.catalogItem.findUnique({
      where: { id },
      include: {
        skuMappings: { include: { supplier: true } },
        prices: { include: { supplier: true }, orderBy: { validFrom: 'desc' } },
      },
    });
  }

  async create(data: CreateCatalogItemInput) {
    return prisma.catalogItem.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: categoryMap[data.category || 'Cardio'] || 'Cardio',
        description: data.description,
        unitCbm: data.unit_cbm ?? 0,
        unitWeightKg: data.unit_weight_kg ?? 0,
        hsCode: data.hs_code,
        ncmCode: data.ncm_code,
        imageUrl: data.image_url,
        isActive: data.is_active ?? true,
      },
    });
  }

  async update(id: string, data: UpdateCatalogItemInput) {
    return prisma.catalogItem.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category ? categoryMap[data.category] : undefined,
        description: data.description,
        unitCbm: data.unit_cbm,
        unitWeightKg: data.unit_weight_kg,
        hsCode: data.hs_code,
        ncmCode: data.ncm_code,
        imageUrl: data.image_url,
        isActive: data.is_active,
      },
    });
  }

  async delete(id: string) {
    return prisma.catalogItem.delete({ where: { id } });
  }

  async softDelete(id: string) {
    return prisma.catalogItem.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const catalogRepository = new CatalogRepository();
