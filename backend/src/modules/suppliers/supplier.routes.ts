/**
 * Supplier Routes
 */

import { Router } from 'express';
import { supplierController } from './supplier.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => supplierController.getAll(req, res, next));
router.get('/:id', (req, res, next) => supplierController.getById(req, res, next));
router.post('/', (req, res, next) => supplierController.create(req, res, next));
router.put('/:id', (req, res, next) => supplierController.update(req, res, next));
router.patch('/:id', (req, res, next) => supplierController.update(req, res, next));
router.delete('/:id', (req, res, next) => supplierController.delete(req, res, next));

export default router;
