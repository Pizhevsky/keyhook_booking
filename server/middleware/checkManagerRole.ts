import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

export async function checkManagerRole(req: Request, res: Response, next: NextFunction) {
  const managerId = req.body.managerId || req.params.managerId;
  
  if (!managerId) {
    return res.status(400).json({ error: 'managerId required' });
  }

  const manager = await User.findByPk(managerId);
  if (!manager || manager.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers allowed' });
  }

  next();
}