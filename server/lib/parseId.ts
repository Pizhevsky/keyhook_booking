import { AppError } from '../types';

export function parseId(raw: string | undefined, label = 'id'): number {
  const n = Number(raw);
  if (!raw || !Number.isInteger(n) || n <= 0) {
    throw new AppError(400, `Invalid ${label}: must be a positive integer`);
  }
  return n;
}