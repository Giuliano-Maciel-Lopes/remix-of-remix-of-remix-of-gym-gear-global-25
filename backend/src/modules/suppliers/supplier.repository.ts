/**
 * Supplier Repository
 */

import prisma from '../../shared/prisma.js';
import type { CreateSupplierInput, UpdateSupplierInput } from './supplier.schemas.js';

export class SupplierRepository {
  async findAll(includeInactive = false) {
    return prisma.supplier.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        skuMappings: { take: 20 },
        prices: { take: 20, orderBy: { validFrom: 'desc' } },
      },
    });
  }

  async create(data: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email,
        country: data.country || 'CN',
        defaultCurrency: data.default_currency || 'USD',
        incotermDefault: data.incoterm_default || 'FOB',
        leadTimeDays: data.lead_time_days ?? 45,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        notes: data.notes,
        isActive: data.is_active ?? true,
      },
    });
  }

  async update(id: string, data: UpdateSupplierInput) {
    return prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        country: data.country,
        defaultCurrency: data.default_currency,
        incotermDefault: data.incoterm_default,
        leadTimeDays: data.lead_time_days,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        notes: data.notes,
        isActive: data.is_active,
      },
    });
  }

  async delete(id: string) {
    return prisma.supplier.delete({ where: { id } });
  }

  async softDelete(id: string) {
    return prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const supplierRepository = new SupplierRepository();
