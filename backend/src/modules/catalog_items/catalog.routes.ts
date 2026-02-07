/**
 * Catalog Item Routes
 */

import { Router } from 'express';
import { catalogController } from './catalog.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => catalogController.getAll(req, res, next));
router.get('/:id', (req, res, next) => catalogController.getById(req, res, next));
router.post('/', (req, res, next) => catalogController.create(req, res, next));
router.put('/:id', (req, res, next) => catalogController.update(req, res, next));
router.patch('/:id', (req, res, next) => catalogController.update(req, res, next));
router.delete('/:id', (req, res, next) => catalogController.delete(req, res, next));

export default router;
