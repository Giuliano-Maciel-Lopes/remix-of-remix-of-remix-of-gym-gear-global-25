/**
 * Kit Controller
 */

import { Request, Response, NextFunction } from 'express';
import { kitService } from './kit.service.js';
import { z } from 'zod';

const generateKitSchema = z.object({
  store_size: z.enum(['small', 'medium', 'large']),
  budget_usd: z.number().min(1),
});

export class KitController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const input = generateKitSchema.parse(req.body);
      const result = await kitService.generate(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const kitController = new KitController();
