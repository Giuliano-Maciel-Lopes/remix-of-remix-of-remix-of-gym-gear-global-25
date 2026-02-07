/**
 * Quote Validation Schemas
 */

import { z } from 'zod';

const containerTypeEnum = z.enum(['20FT', '40FT', '40HC']);
const destinationCountryEnum = z.enum(['US', 'AR', 'BR']);
const quoteStatusEnum = z.enum(['draft', 'pending', 'approved', 'ordered', 'cancelled']);

export const quoteLineSchema = z.object({
  id: z.string().uuid().optional(),
  catalog_item_id: z.string().uuid(),
  chosen_supplier_id: z.string().uuid(),
  qty: z.number().int().min(1).default(1),
  override_price_fob_usd: z.number().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const createQuoteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  client_id: z.string().uuid().nullable().optional(),
  status: quoteStatusEnum.default('draft'),
  destination_country: destinationCountryEnum.default('BR'),
  container_type: containerTypeEnum.default('40HC'),
  container_qty_override: z.number().int().min(1).nullable().optional(),
  freight_per_container_usd: z.number().min(0).default(3500),
  insurance_rate: z.number().min(0).max(1).default(0.005),
  fixed_costs_usd: z.number().min(0).default(500),
  notes: z.string().max(2000).nullable().optional(),
  lines: z.array(quoteLineSchema).optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const quoteIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteLineInput = z.infer<typeof quoteLineSchema>;
