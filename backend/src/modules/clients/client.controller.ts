/**
 * Client Controller
 * HTTP request handlers for clients
 */

import { Request, Response, NextFunction } from 'express';
import { clientService } from './client.service.js';
import { createClientSchema, updateClientSchema, clientIdSchema } from './client.schemas.js';

export class ClientController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const clients = await clientService.getAll(includeInactive);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const client = await clientService.getById(id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createClientSchema.parse(req.body);
      const client = await clientService.create(input);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const input = updateClientSchema.parse(req.body);
      const client = await clientService.update(id, input);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const soft = req.query.soft !== 'false';
      await clientService.delete(id, soft);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
