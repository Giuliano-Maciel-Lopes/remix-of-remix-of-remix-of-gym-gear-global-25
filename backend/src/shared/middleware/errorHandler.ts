/**
 * Global Error Handler Middleware
 * Returns standardized error responses without exposing internal details
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log internally but never expose to client
  console.error('Error:', err.message);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: true,
      message: 'Dados inválidos. Verifique os campos e tente novamente.',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // Prisma errors — friendly messages, no internals
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: true,
        message: 'Já existe um registro com esses dados.',
        code: 'DUPLICATE_RECORD',
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'Registro não encontrado.',
        code: 'NOT_FOUND',
      });
    }

    if (prismaError.code === 'P2003') {
      return res.status(400).json({
        error: true,
        message: 'Não é possível realizar esta operação pois existem registros vinculados.',
        code: 'FOREIGN_KEY_VIOLATION',
      });
    }
  }

  // Unknown errors — never expose stack or message in production
  return res.status(500).json({
    error: true,
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
    code: 'INTERNAL_ERROR',
  });
}
