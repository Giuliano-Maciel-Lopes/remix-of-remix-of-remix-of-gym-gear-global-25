/**
 * Supplier Price Service
 */

import { supplierPriceRepository } from './supplierPrice.repository.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import type { CreateSupplierPriceInput, UpdateSupplierPriceInput } from './supplierPrice.schemas.js';

export class SupplierPriceService {
  async getAll() {
    const prices = await supplierPriceRepository.findAll();
    
    return prices.map(p => ({
      id: p.id,
      supplier_id: p.supplierId,
      catalog_item_id: p.catalogItemId,
      price_fob_usd: p.priceFobUsd,
      currency_original: p.currencyOriginal,
      price_original: p.priceOriginal,
      valid_from: p.validFrom.toISOString(),
      valid_until: p.validUntil?.toISOString() || null,
      moq: p.moq,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));
  }

  async getById(id: string) {
    const price = await supplierPriceRepository.findById(id);
    
    if (!price) {
      throw new AppError(404, 'Preço não encontrado');
    }

    return {
      id: price.id,
      supplier_id: price.supplierId,
      catalog_item_id: price.catalogItemId,
      price_fob_usd: price.priceFobUsd,
      currency_original: price.currencyOriginal,
      price_original: price.priceOriginal,
      valid_from: price.validFrom.toISOString(),
      valid_until: price.validUntil?.toISOString() || null,
      moq: price.moq,
      created_at: price.createdAt.toISOString(),
      updated_at: price.updatedAt.toISOString(),
    };
  }

  async create(input: CreateSupplierPriceInput) {
    const price = await supplierPriceRepository.create(input);
    
    return {
      id: price.id,
      supplier_id: price.supplierId,
      catalog_item_id: price.catalogItemId,
      price_fob_usd: price.priceFobUsd,
      currency_original: price.currencyOriginal,
      price_original: price.priceOriginal,
      valid_from: price.validFrom.toISOString(),
      valid_until: price.validUntil?.toISOString() || null,
      moq: price.moq,
      created_at: price.createdAt.toISOString(),
      updated_at: price.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateSupplierPriceInput) {
    const existing = await supplierPriceRepository.findById(id);
    if (!existing) throw new AppError(404, 'Preço não encontrado');

    const price = await supplierPriceRepository.update(id, input);
    
    return {
      id: price.id,
      supplier_id: price.supplierId,
      catalog_item_id: price.catalogItemId,
      price_fob_usd: price.priceFobUsd,
      currency_original: price.currencyOriginal,
      price_original: price.priceOriginal,
      valid_from: price.validFrom.toISOString(),
      valid_until: price.validUntil?.toISOString() || null,
      moq: price.moq,
      created_at: price.createdAt.toISOString(),
      updated_at: price.updatedAt.toISOString(),
    };
  }

  async delete(id: string) {
    const existing = await supplierPriceRepository.findById(id);
    if (!existing) throw new AppError(404, 'Preço não encontrado');

    await supplierPriceRepository.delete(id);
    return { success: true };
  }
}

export const supplierPriceService = new SupplierPriceService();
