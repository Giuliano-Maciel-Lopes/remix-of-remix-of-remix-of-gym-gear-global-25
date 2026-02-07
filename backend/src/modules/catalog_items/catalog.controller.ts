/**
 * Catalog Item Controller
 */

import { Request, Response, NextFunction } from 'express';
import { catalogService } from './catalog.service.js';
import { createCatalogItemSchema, updateCatalogItemSchema, catalogItemIdSchema } from './catalog.schemas.js';

export class CatalogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const items = await catalogService.getAll(includeInactive);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = catalogItemIdSchema.parse(req.params);
      const item = await catalogService.getById(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createCatalogItemSchema.parse(req.body);
      const item = await catalogService.create(input);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = catalogItemIdSchema.parse(req.params);
      const input = updateCatalogItemSchema.parse(req.body);
      const item = await catalogService.update(id, input);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = catalogItemIdSchema.parse(req.params);
      const soft = req.query.soft !== 'false';
      await catalogService.delete(id, soft);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const catalogController = new CatalogController();
