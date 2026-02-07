/**
 * Auth Routes
 */

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected routes
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
