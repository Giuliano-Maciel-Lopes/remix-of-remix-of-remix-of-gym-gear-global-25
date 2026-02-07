/**
 * Supplier Price Schemas
 */

import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']);

export const createSupplierPriceSchema = z.object({
  supplier_id: z.string().uuid(),
  catalog_item_id: z.string().uuid(),
  price_fob_usd: z.number().positive(),
  currency_original: currencyEnum.default('USD'),
  price_original: z.number().positive(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  moq: z.number().int().min(1).nullable().optional(),
});

export const updateSupplierPriceSchema = createSupplierPriceSchema.partial();

export const supplierPriceIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierPriceInput = z.infer<typeof createSupplierPriceSchema>;
export type UpdateSupplierPriceInput = z.infer<typeof updateSupplierPriceSchema>;
