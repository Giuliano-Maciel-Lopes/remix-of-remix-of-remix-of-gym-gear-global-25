/**
 * Supplier Controller
 */

import { Request, Response, NextFunction } from 'express';
import { supplierService } from './supplier.service.js';
import { createSupplierSchema, updateSupplierSchema, supplierIdSchema } from './supplier.schemas.js';

export class SupplierController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const suppliers = await supplierService.getAll(includeInactive);
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierIdSchema.parse(req.params);
      const supplier = await supplierService.getById(id);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSupplierSchema.parse(req.body);
      const supplier = await supplierService.create(input);
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierIdSchema.parse(req.params);
      const input = updateSupplierSchema.parse(req.body);
      const supplier = await supplierService.update(id, input);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = supplierIdSchema.parse(req.params);
      const soft = req.query.soft !== 'false';
      await supplierService.delete(id, soft);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
