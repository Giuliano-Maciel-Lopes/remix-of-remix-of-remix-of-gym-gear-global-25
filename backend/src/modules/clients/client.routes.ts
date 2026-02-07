/**
 * Client Routes
 */

import { Router } from 'express';
import { clientController } from './client.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => clientController.getAll(req, res, next));
router.get('/:id', (req, res, next) => clientController.getById(req, res, next));
router.post('/', (req, res, next) => clientController.create(req, res, next));
router.put('/:id', (req, res, next) => clientController.update(req, res, next));
router.patch('/:id', (req, res, next) => clientController.update(req, res, next));
router.delete('/:id', (req, res, next) => clientController.delete(req, res, next));

export default router;
