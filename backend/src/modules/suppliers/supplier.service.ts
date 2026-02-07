/**
 * Supplier Service
 */

import { supplierRepository } from './supplier.repository.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import type { CreateSupplierInput, UpdateSupplierInput } from './supplier.schemas.js';

export class SupplierService {
  async getAll(includeInactive = false) {
    const suppliers = await supplierRepository.findAll(includeInactive);
    
    return suppliers.map(s => ({
      id: s.id,
      name: s.name,
      country: s.country,
      default_currency: s.defaultCurrency,
      incoterm_default: s.incotermDefault,
      lead_time_days: s.leadTimeDays,
      contact_email: s.contactEmail,
      contact_phone: s.contactPhone,
      notes: s.notes,
      is_active: s.isActive,
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
    }));
  }

  async getById(id: string) {
    const supplier = await supplierRepository.findById(id);
    
    if (!supplier) {
      throw new AppError(404, 'Fornecedor não encontrado');
    }

    return {
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      default_currency: supplier.defaultCurrency,
      incoterm_default: supplier.incotermDefault,
      lead_time_days: supplier.leadTimeDays,
      contact_email: supplier.contactEmail,
      contact_phone: supplier.contactPhone,
      notes: supplier.notes,
      is_active: supplier.isActive,
      created_at: supplier.createdAt.toISOString(),
      updated_at: supplier.updatedAt.toISOString(),
    };
  }

  async create(input: CreateSupplierInput) {
    const supplier = await supplierRepository.create(input);
    
    return {
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      default_currency: supplier.defaultCurrency,
      incoterm_default: supplier.incotermDefault,
      lead_time_days: supplier.leadTimeDays,
      contact_email: supplier.contactEmail,
      contact_phone: supplier.contactPhone,
      notes: supplier.notes,
      is_active: supplier.isActive,
      created_at: supplier.createdAt.toISOString(),
      updated_at: supplier.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateSupplierInput) {
    const existing = await supplierRepository.findById(id);
    if (!existing) throw new AppError(404, 'Fornecedor não encontrado');

    const supplier = await supplierRepository.update(id, input);
    
    return {
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      default_currency: supplier.defaultCurrency,
      incoterm_default: supplier.incotermDefault,
      lead_time_days: supplier.leadTimeDays,
      contact_email: supplier.contactEmail,
      contact_phone: supplier.contactPhone,
      notes: supplier.notes,
      is_active: supplier.isActive,
      created_at: supplier.createdAt.toISOString(),
      updated_at: supplier.updatedAt.toISOString(),
    };
  }

  async delete(id: string, soft = true) {
    const existing = await supplierRepository.findById(id);
    if (!existing) throw new AppError(404, 'Fornecedor não encontrado');

    if (soft) {
      await supplierRepository.softDelete(id);
    } else {
      await supplierRepository.delete(id);
    }

    return { success: true };
  }
}

export const supplierService = new SupplierService();
