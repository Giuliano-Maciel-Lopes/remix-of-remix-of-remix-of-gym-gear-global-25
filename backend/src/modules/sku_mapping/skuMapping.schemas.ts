/**
 * SKU Mapping Schemas
 */

import { z } from 'zod';

export const createSkuMappingSchema = z.object({
  supplier_id: z.string().uuid(),
  supplier_model_code: z.string().min(1).max(100),
  catalog_item_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateSkuMappingSchema = createSkuMappingSchema.partial();

export const skuMappingIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSkuMappingInput = z.infer<typeof createSkuMappingSchema>;
export type UpdateSkuMappingInput = z.infer<typeof updateSkuMappingSchema>;
