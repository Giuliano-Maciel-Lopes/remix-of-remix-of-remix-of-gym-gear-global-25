/**
 * SKU Mapping Service
 */

import { skuMappingRepository } from './skuMapping.repository.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import type { CreateSkuMappingInput, UpdateSkuMappingInput } from './skuMapping.schemas.js';

export class SkuMappingService {
  async getAll() {
    const mappings = await skuMappingRepository.findAll();
    
    return mappings.map(m => ({
      id: m.id,
      supplier_id: m.supplierId,
      supplier_model_code: m.supplierModelCode,
      catalog_item_id: m.catalogItemId,
      notes: m.notes,
      created_at: m.createdAt.toISOString(),
      updated_at: m.updatedAt.toISOString(),
    }));
  }

  async getById(id: string) {
    const mapping = await skuMappingRepository.findById(id);
    
    if (!mapping) {
      throw new AppError(404, 'Mapeamento não encontrado');
    }

    return {
      id: mapping.id,
      supplier_id: mapping.supplierId,
      supplier_model_code: mapping.supplierModelCode,
      catalog_item_id: mapping.catalogItemId,
      notes: mapping.notes,
      created_at: mapping.createdAt.toISOString(),
      updated_at: mapping.updatedAt.toISOString(),
    };
  }

  async create(input: CreateSkuMappingInput) {
    const mapping = await skuMappingRepository.create(input);
    
    return {
      id: mapping.id,
      supplier_id: mapping.supplierId,
      supplier_model_code: mapping.supplierModelCode,
      catalog_item_id: mapping.catalogItemId,
      notes: mapping.notes,
      created_at: mapping.createdAt.toISOString(),
      updated_at: mapping.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateSkuMappingInput) {
    const existing = await skuMappingRepository.findById(id);
    if (!existing) throw new AppError(404, 'Mapeamento não encontrado');

    const mapping = await skuMappingRepository.update(id, input);
    
    return {
      id: mapping.id,
      supplier_id: mapping.supplierId,
      supplier_model_code: mapping.supplierModelCode,
      catalog_item_id: mapping.catalogItemId,
      notes: mapping.notes,
      created_at: mapping.createdAt.toISOString(),
      updated_at: mapping.updatedAt.toISOString(),
    };
  }

  async delete(id: string) {
    const existing = await skuMappingRepository.findById(id);
    if (!existing) throw new AppError(404, 'Mapeamento não encontrado');

    await skuMappingRepository.delete(id);
    return { success: true };
  }
}

export const skuMappingService = new SkuMappingService();
