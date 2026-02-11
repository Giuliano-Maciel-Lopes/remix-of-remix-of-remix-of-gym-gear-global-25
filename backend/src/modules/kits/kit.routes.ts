/**
 * Kit Routes
 */

import { Router } from 'express';
import { kitController } from './kit.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/generate', (req, res, next) => kitController.generate(req, res, next));

export default router;
