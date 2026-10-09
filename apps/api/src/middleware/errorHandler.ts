import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      message: errorDetails,
      code: 'VALIDATION_ERROR',
      errors: err.errors
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
}
