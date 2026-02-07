/**
 * Client Service
 * Business logic for clients
 */

import { clientRepository } from './client.repository.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import type { CreateClientInput, UpdateClientInput } from './client.schemas.js';

export class ClientService {
  async getAll(includeInactive = false) {
    const clients = await clientRepository.findAll(includeInactive);
    
    // Map to API format (snake_case)
    return clients.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      default_currency: c.defaultCurrency,
      contact_email: c.contactEmail,
      contact_phone: c.contactPhone,
      notes: c.notes,
      is_active: c.isActive,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }));
  }

  async getById(id: string) {
    const client = await clientRepository.findById(id);
    
    if (!client) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    return {
      id: client.id,
      name: client.name,
      country: client.country,
      default_currency: client.defaultCurrency,
      contact_email: client.contactEmail,
      contact_phone: client.contactPhone,
      notes: client.notes,
      is_active: client.isActive,
      created_at: client.createdAt.toISOString(),
      updated_at: client.updatedAt.toISOString(),
      quotes: client.quotes,
    };
  }

  async create(input: CreateClientInput) {
    const client = await clientRepository.create(input);
    
    return {
      id: client.id,
      name: client.name,
      country: client.country,
      default_currency: client.defaultCurrency,
      contact_email: client.contactEmail,
      contact_phone: client.contactPhone,
      notes: client.notes,
      is_active: client.isActive,
      created_at: client.createdAt.toISOString(),
      updated_at: client.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateClientInput) {
    const existing = await clientRepository.findById(id);
    
    if (!existing) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    const client = await clientRepository.update(id, input);
    
    return {
      id: client.id,
      name: client.name,
      country: client.country,
      default_currency: client.defaultCurrency,
      contact_email: client.contactEmail,
      contact_phone: client.contactPhone,
      notes: client.notes,
      is_active: client.isActive,
      created_at: client.createdAt.toISOString(),
      updated_at: client.updatedAt.toISOString(),
    };
  }

  async delete(id: string, soft = true) {
    const existing = await clientRepository.findById(id);
    
    if (!existing) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    if (soft) {
      await clientRepository.softDelete(id);
    } else {
      await clientRepository.delete(id);
    }

    return { success: true };
  }
}

export const clientService = new ClientService();
