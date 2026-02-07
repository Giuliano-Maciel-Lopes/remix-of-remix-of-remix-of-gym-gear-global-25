/**
 * SKU Mapping Controller
 */

import { Request, Response, NextFunction } from 'express';
import { skuMappingService } from './skuMapping.service.js';
import { createSkuMappingSchema, updateSkuMappingSchema, skuMappingIdSchema } from './skuMapping.schemas.js';

export class SkuMappingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const mappings = await skuMappingService.getAll();
      res.json(mappings);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = skuMappingIdSchema.parse(req.params);
      const mapping = await skuMappingService.getById(id);
      res.json(mapping);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSkuMappingSchema.parse(req.body);
      const mapping = await skuMappingService.create(input);
      res.status(201).json(mapping);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = skuMappingIdSchema.parse(req.params);
      const input = updateSkuMappingSchema.parse(req.body);
      const mapping = await skuMappingService.update(id, input);
      res.json(mapping);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = skuMappingIdSchema.parse(req.params);
      await skuMappingService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const skuMappingController = new SkuMappingController();
