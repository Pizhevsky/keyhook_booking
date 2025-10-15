import { Request, Response, NextFunction } from 'express';

export function validateUser(req: Request, res: Response, next: NextFunction) {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'name and role required' });
  }

  if (!['tenant', 'manager'].includes(role)) {
    return res.status(400).json({ error: 'role must be tenant or manager' });
  }
  
  next();
}