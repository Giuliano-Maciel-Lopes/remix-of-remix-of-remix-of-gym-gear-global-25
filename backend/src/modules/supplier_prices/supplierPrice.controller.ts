/**
 * Supplier Price Controller
 */

import { Request, Response, NextFunction } from 'express';
import { supplierPriceService } from './supplierPrice.service.js';
import { createSupplierPriceSchema, updateSupplierPriceSchema, supplierPriceIdSchema } from './supplierPrice.schemas.js';

export class SupplierPriceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const prices = await supplierPriceService.getAll();
      res.json(prices);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierPriceIdSchema.parse(req.params);
      const price = await supplierPriceService.getById(id);
      res.json(price);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSupplierPriceSchema.parse(req.body);
      const price = await supplierPriceService.create(input);
      res.status(201).json(price);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierPriceIdSchema.parse(req.params);
      const input = updateSupplierPriceSchema.parse(req.body);
      const price = await supplierPriceService.update(id, input);
      res.json(price);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierPriceIdSchema.parse(req.params);
      await supplierPriceService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const supplierPriceController = new SupplierPriceController();
