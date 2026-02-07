/**
 * Quote Controller
 */

import { Request, Response, NextFunction } from 'express';
import { quoteService } from './quote.service.js';
import { createQuoteSchema, updateQuoteSchema, quoteIdSchema, quoteLineSchema } from './quote.schemas.js';
import { z } from 'zod';

export class QuoteController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const quotes = await quoteService.getAll();
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = quoteIdSchema.parse(req.params);
      const quote = await quoteService.getById(id);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createQuoteSchema.parse(req.body);
      const userId = req.user?.userId;
      const quote = await quoteService.create(input, userId);
      res.status(201).json(quote);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = quoteIdSchema.parse(req.params);
      const input = updateQuoteSchema.parse(req.body);
      const quote = await quoteService.update(id, input);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = quoteIdSchema.parse(req.params);
      await quoteService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addLine(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = quoteIdSchema.parse(req.params);
      const line = quoteLineSchema.parse(req.body);
      const quote = await quoteService.addLine(id, line);
      res.status(201).json(quote);
    } catch (error) {
      next(error);
    }
  }

  async updateLine(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, lineId } = z.object({
        id: z.string().uuid(),
        lineId: z.string().uuid(),
      }).parse(req.params);
      const line = quoteLineSchema.partial().parse(req.body);
      const quote = await quoteService.updateLine(id, lineId, line);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  }

  async deleteLine(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, lineId } = z.object({
        id: z.string().uuid(),
        lineId: z.string().uuid(),
      }).parse(req.params);
      const quote = await quoteService.deleteLine(id, lineId);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  }
}

export const quoteController = new QuoteController();
