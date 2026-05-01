import { Router } from 'express';
import { parseId } from '../lib/parseId';
import { checkManagerRole } from '../middleware/checkManagerRole';
import {
  getAllAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability
} from '../services/availabilityService';
import {
  validateCreateAvailability,
  validateUpdateAvailability,
} from '../middleware/validate';

const router = Router();


router.get('/', 
  async (req, res, next) => {
    try {
      res.json(await getAllAvailability());
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validateCreateAvailability,
  checkManagerRole,
  async (req, res, next) => {
    try {
      res.status(201).json(
        await createAvailability(res.locals.validatedBody),
      );
    } catch (err) {
      next(err);
    }
  },
);

router.put('/:id',
  validateUpdateAvailability,
  async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      res.json(
        await updateAvailability(id, res.locals.validatedBody),
      );
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const managerId = parseId(req.query.managerId as string, 'managerId');
    
    res.json(await deleteAvailability(id, managerId));
  } catch (err) {
    next(err);
  }
});

export default router;