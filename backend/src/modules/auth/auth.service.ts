/**
 * Auth Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import prisma from '../../shared/prisma.js';
import { generateToken, JwtPayload } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: {
          create: { role: 'user' },
        },
      },
      include: { role: true },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role?.role || 'user',
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role || 'user',
      },
      token,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: true },
    });

    if (!user) {
      throw new AppError(401, 'Email ou senha incorretos');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Email ou senha incorretos');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role?.role || 'user',
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role || 'user',
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role?.role || 'user',
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
