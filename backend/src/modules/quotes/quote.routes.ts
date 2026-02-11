/**
 * Quote Routes
 */

import { Router } from 'express';
import { quoteController } from './quote.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

// Compare suppliers (must be before /:id routes)
router.post('/compare', (req, res, next) => quoteController.compare(req, res, next));

// CRUD for quotes
router.get('/', (req, res, next) => quoteController.getAll(req, res, next));
router.get('/:id', (req, res, next) => quoteController.getById(req, res, next));
router.post('/', (req, res, next) => quoteController.create(req, res, next));
router.put('/:id', (req, res, next) => quoteController.update(req, res, next));
router.patch('/:id', (req, res, next) => quoteController.update(req, res, next));
router.delete('/:id', (req, res, next) => quoteController.delete(req, res, next));

// Change client
router.patch('/:id/change-client', (req, res, next) => quoteController.changeClient(req, res, next));

// Quote lines
router.post('/:id/lines', (req, res, next) => quoteController.addLine(req, res, next));
router.put('/:id/lines/:lineId', (req, res, next) => quoteController.updateLine(req, res, next));
router.patch('/:id/lines/:lineId', (req, res, next) => quoteController.updateLine(req, res, next));
router.delete('/:id/lines/:lineId', (req, res, next) => quoteController.deleteLine(req, res, next));

export default router;
