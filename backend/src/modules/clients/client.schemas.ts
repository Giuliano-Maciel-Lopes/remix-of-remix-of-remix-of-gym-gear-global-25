/**
 * Client Validation Schemas
 */

import { z } from 'zod';

const currencyEnum = z.enum(['USD', 'CNY', 'EUR', 'BRL', 'ARS']);

export const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  country: z.string().min(2).max(100).default('BR'),
  default_currency: currencyEnum.default('USD'),
  contact_email: z.string().email().max(255).nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().default(true),
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
