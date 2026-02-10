/**
 * AI Controller - handles HTTP requests for AI analysis endpoints
 * All endpoints are read-only - never modify data
 */

import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';

export class AIController {
  async generateKit(req: Request, res: Response, next: NextFunction) {
    try {
      const { profile, budget_usd, destination_country, area_m2 } = req.body;
      if (!profile || !budget_usd || !destination_country) {
        return res.status(400).json({ error: 'Campos obrigatórios: profile, budget_usd, destination_country' });
      }
      const result = await aiService.generateKit({ profile, budget_usd, destination_country, area_m2 });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async analyzePrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { catalog_item_id, category } = req.body;
      const result = await aiService.analyzePrices({ catalog_item_id, category });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async simulate(req: Request, res: Response, next: NextFunction) {
    try {
      const { quote_id } = req.body;
      if (!quote_id) {
        return res.status(400).json({ error: 'Campo obrigatório: quote_id' });
      }
      const result = await aiService.simulateScenarios({ quote_id });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async suggestHsCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, description } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: 'Campos obrigatórios: name, category' });
      }
      const result = await aiService.suggestHsCode({ name, category, description });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getInsights();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async planImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination_country, budget_usd, operation_size } = req.body;
      if (!destination_country || !budget_usd || !operation_size) {
        return res.status(400).json({ error: 'Campos obrigatórios: destination_country, budget_usd, operation_size' });
      }
      const result = await aiService.planImport({ destination_country, budget_usd, operation_size });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
