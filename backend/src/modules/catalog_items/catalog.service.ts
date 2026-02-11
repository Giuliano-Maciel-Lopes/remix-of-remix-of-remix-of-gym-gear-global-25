/**
 * Catalog Item Service
 */

import { catalogRepository } from './catalog.repository.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import prisma from '../../shared/prisma.js';
import type { CreateCatalogItemInput, UpdateCatalogItemInput } from './catalog.schemas.js';

const categoryReverseMap: Record<string, string> = {
  'Cardio': 'Cardio',
  'Strength': 'Strength',
  'FreeWeights': 'Free Weights',
  'Benches': 'Benches',
  'Accessories': 'Accessories',
  'Functional': 'Functional',
};

export class CatalogService {
  async getAll(includeInactive = false) {
    const items = await catalogRepository.findAll(includeInactive);
    
    return items.map(i => ({
      id: i.id,
      sku: i.sku,
      name: i.name,
      category: categoryReverseMap[i.category] || i.category,
      description: i.description,
      unit_cbm: i.unitCbm,
      unit_weight_kg: i.unitWeightKg,
      hs_code: i.hsCode,
      ncm_code: i.ncmCode,
      image_url: i.imageUrl,
      is_active: i.isActive,
      created_at: i.createdAt.toISOString(),
      updated_at: i.updatedAt.toISOString(),
    }));
  }

  async getById(id: string) {
    const item = await catalogRepository.findById(id);
    
    if (!item) {
      throw new AppError(404, 'Item do catálogo não encontrado');
    }

    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: categoryReverseMap[item.category] || item.category,
      description: item.description,
      unit_cbm: item.unitCbm,
      unit_weight_kg: item.unitWeightKg,
      hs_code: item.hsCode,
      ncm_code: item.ncmCode,
      image_url: item.imageUrl,
      is_active: item.isActive,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }

  async create(input: CreateCatalogItemInput) {
    const item = await catalogRepository.create(input);
    
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: categoryReverseMap[item.category] || item.category,
      description: item.description,
      unit_cbm: item.unitCbm,
      unit_weight_kg: item.unitWeightKg,
      hs_code: item.hsCode,
      ncm_code: item.ncmCode,
      image_url: item.imageUrl,
      is_active: item.isActive,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateCatalogItemInput) {
    const existing = await catalogRepository.findById(id);
    if (!existing) throw new AppError(404, 'Item do catálogo não encontrado');

    const item = await catalogRepository.update(id, input);
    
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: categoryReverseMap[item.category] || item.category,
      description: item.description,
      unit_cbm: item.unitCbm,
      unit_weight_kg: item.unitWeightKg,
      hs_code: item.hsCode,
      ncm_code: item.ncmCode,
      image_url: item.imageUrl,
      is_active: item.isActive,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }

  async delete(id: string, soft = true) {
    const existing = await catalogRepository.findById(id);
    if (!existing) throw new AppError(404, 'Item do catálogo não encontrado');

    if (!soft) {
      // Check for related records before hard delete
      const [pricesCount, quoteLinesCount] = await Promise.all([
        prisma.supplierPrice.count({ where: { catalogItemId: id } }),
        prisma.quoteLine.count({ where: { catalogItemId: id } }),
      ]);

      if (pricesCount > 0 || quoteLinesCount > 0) {
        throw new AppError(400, 'Não é possível excluir este item pois ele está vinculado a outros dados.', 'HAS_DEPENDENCIES');
      }
    }

    if (soft) {
      await catalogRepository.softDelete(id);
    } else {
      await catalogRepository.delete(id);
    }

    return { success: true };
  }
}

export const catalogService = new CatalogService();
