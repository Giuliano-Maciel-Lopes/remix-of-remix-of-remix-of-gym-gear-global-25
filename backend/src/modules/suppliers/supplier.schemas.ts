/**
 * Supplier Validation Schemas
 */

import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']);
const incotermEnum = z.enum(['FOB', 'CIF', 'EXW', 'DDP']);

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  country: z.string().min(2).max(100).default('CN'),
  default_currency: currencyEnum.default('USD'),
  incoterm_default: incotermEnum.default('FOB'),
  lead_time_days: z.number().int().min(0).max(365).default(45),
  contact_email: z.string().email().max(255).nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().default(true),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
