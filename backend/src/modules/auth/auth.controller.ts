/**
 * Auth Controller
 * HTTP request handlers for authentication
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
