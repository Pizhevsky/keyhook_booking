import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

const IS_PROD = process.env.NODE_ENV === 'production';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);

  const message = IS_PROD
    ? 'Internal server error'
    : err instanceof Error ? err.message : 'Internal server error';

  res.status(500).json({ error: message });
}
