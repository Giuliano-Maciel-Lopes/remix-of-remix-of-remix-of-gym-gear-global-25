/**
 * Zod Validation Schemas for all forms
 */

import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  default_currency: z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']),
  contact_email: z.string().email('Email inválido').or(z.literal('')).optional(),
  contact_phone: z.string().max(30, 'Telefone deve ter no máximo 30 caracteres').optional(),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  is_active: z.boolean(),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  default_currency: z.enum(['USD', 'CNY', 'EUR']),
  incoterm_default: z.enum(['FOB', 'CIF', 'EXW', 'DDP']),
  lead_time_days: z.number().int().min(1, 'Lead time deve ser pelo menos 1 dia').max(365, 'Lead time máximo: 365 dias'),
  contact_email: z.string().email('Email inválido').or(z.literal('')).optional(),
  contact_phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  is_active: z.boolean(),
});

export const catalogItemSchema = z.object({
  sku: z.string().trim().min(1, 'SKU é obrigatório').max(50, 'SKU deve ter no máximo 50 caracteres'),
  name: z.string().trim().min(1, 'Nome é obrigatório').max(200, 'Nome deve ter no máximo 200 caracteres'),
  category: z.enum(['Cardio', 'Strength', 'Free Weights', 'Benches', 'Accessories', 'Functional']),
  description: z.string().max(1000).optional(),
  unit_cbm: z.number().min(0, 'CBM deve ser maior ou igual a zero'),
  unit_weight_kg: z.number().min(0, 'Peso deve ser maior ou igual a zero'),
  hs_code: z.string().max(20).optional(),
  ncm_code: z.string().max(20).optional(),
  is_active: z.boolean(),
});

export const supplierPriceSchema = z.object({
  supplier_id: z.string().min(1, 'Fornecedor é obrigatório'),
  catalog_item_id: z.string().min(1, 'Item é obrigatório'),
  price_fob_usd: z.number().positive('Preço FOB deve ser maior que zero'),
  currency_original: z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']),
  price_original: z.number().min(0, 'Preço original deve ser maior ou igual a zero'),
  valid_from: z.string().min(1, 'Data de validade é obrigatória'),
  moq: z.number().int().min(1, 'MOQ deve ser pelo menos 1'),
});

export const skuMappingSchema = z.object({
  supplier_id: z.string().min(1, 'Fornecedor é obrigatório'),
  supplier_model_code: z.string().trim().min(1, 'Código do fornecedor é obrigatório'),
  catalog_item_id: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type ValidationErrors = Record<string, string>;

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; errors: ValidationErrors; data?: T } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }
  const errors: ValidationErrors = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  return { success: false, errors };
}
