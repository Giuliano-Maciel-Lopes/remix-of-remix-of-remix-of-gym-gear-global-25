/**
 * Supplier Price Schemas
 */

import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']);

export const createSupplierPriceSchema = z.object({
  supplier_id: z.string().min(1, 'Fornecedor é obrigatório'),
  catalog_item_id: z.string().min(1, 'Item do catálogo é obrigatório'),
  price_fob_usd: z.number().positive('Preço FOB deve ser maior que zero'),
  currency_original: currencyEnum.default('USD'),
  price_original: z.number().min(0, 'Preço original deve ser >= 0'),
  valid_from: z.string().min(1).optional(),
  valid_until: z.string().nullable().optional(),
  moq: z.number().int().min(1).nullable().optional(),
});

export const updateSupplierPriceSchema = createSupplierPriceSchema.partial();

export const supplierPriceIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierPriceInput = z.infer<typeof createSupplierPriceSchema>;
export type UpdateSupplierPriceInput = z.infer<typeof updateSupplierPriceSchema>;
