import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { AppError } from '../types';

export async function checkManagerRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const managerId = Number(req.body.managerId ?? req.params.managerId);
    
    if (!managerId || Number.isNaN(managerId)) throw new AppError(400, 'managerId required');

    const manager = await User.findByPk(managerId);
    if (!manager || manager.role !== 'manager') {
      throw new AppError(403, 'Only managers allowed');
    }
    
    res.locals.manager = manager;
    next();
  } catch (err) {
    next(err);  
  }
}