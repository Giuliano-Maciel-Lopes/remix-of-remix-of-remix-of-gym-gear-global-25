/**
 * Catalog Item Validation Schemas
 */

import { z } from 'zod';

const categoryEnum = z.enum(['Cardio', 'Strength', 'Free Weights', 'Benches', 'Accessories', 'Functional']);

export const createCatalogItemSchema = z.object({
  sku: z.string().min(1, 'SKU é obrigatório').max(50),
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  category: categoryEnum.default('Cardio'),
  description: z.string().max(1000).nullable().optional(),
  unit_cbm: z.number().min(0).default(0),
  unit_weight_kg: z.number().min(0).default(0),
  hs_code: z.string().max(20).nullable().optional(),
  ncm_code: z.string().max(20).nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  is_active: z.boolean().default(true),
});

export const updateCatalogItemSchema = createCatalogItemSchema.partial();

export const catalogItemIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;
