/**
 * Supplier Price Routes
 */

import { Router } from 'express';
import { supplierPriceController } from './supplierPrice.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => supplierPriceController.getAll(req, res, next));
router.get('/:id', (req, res, next) => supplierPriceController.getById(req, res, next));
router.post('/', (req, res, next) => supplierPriceController.create(req, res, next));
router.put('/:id', (req, res, next) => supplierPriceController.update(req, res, next));
router.patch('/:id', (req, res, next) => supplierPriceController.update(req, res, next));
router.delete('/:id', (req, res, next) => supplierPriceController.delete(req, res, next));

export default router;
