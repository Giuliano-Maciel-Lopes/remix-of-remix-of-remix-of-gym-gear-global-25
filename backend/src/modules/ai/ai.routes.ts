/**
 * AI Routes - all read-only analysis endpoints
 */

import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authMiddleware } from '../../shared/middleware/auth.js';

const router = Router();

// All AI routes require authentication
router.use(authMiddleware);

router.post('/generate-kit', (req, res, next) => aiController.generateKit(req, res, next));
router.post('/analyze-prices', (req, res, next) => aiController.analyzePrices(req, res, next));
router.post('/simulate', (req, res, next) => aiController.simulate(req, res, next));
router.post('/suggest-hs', (req, res, next) => aiController.suggestHsCode(req, res, next));
router.get('/insights', (req, res, next) => aiController.getInsights(req, res, next));
router.post('/plan-import', (req, res, next) => aiController.planImport(req, res, next));

export default router;
