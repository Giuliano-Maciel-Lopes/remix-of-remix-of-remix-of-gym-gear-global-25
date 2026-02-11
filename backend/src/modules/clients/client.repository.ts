/**
 * Client Repository
 * Database operations for clients
 */

import prisma from '../../shared/prisma.js';
import type { CreateClientInput, UpdateClientInput } from './client.schemas.js';

export class ClientRepository {
  async findAll(includeInactive = false) {
    return prisma.client.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        quotes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateClientInput) {
    return prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        country: data.country || 'BR',
        defaultCurrency: data.default_currency || 'USD',
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        notes: data.notes,
        isActive: data.is_active ?? true,
      },
    });
  }

  async update(id: string, data: UpdateClientInput) {
    return prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        country: data.country,
        defaultCurrency: data.default_currency,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        notes: data.notes,
        isActive: data.is_active,
      },
    });
  }

  async delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  }

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const clientRepository = new ClientRepository();
