import { Router } from 'express';
import type { Response } from 'express';
import { 
  validateCreateUser,
  type ValidatedLocals,
  type CreateUserInput,
} from '../middleware/validate';
import { getAllUsers, createUser } from '../services/userService';

const router = Router();

router.get('/', 
  async (req, res, next) => {
    try {
      res.json(await getAllUsers());
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validateCreateUser,
  async (req, res: Response<unknown, ValidatedLocals<CreateUserInput>>, next) => {
    try {
      const { name, role } = res.locals.validatedBody;
      res.status(201).json(await createUser(name, role));
    } catch (err) {
      next(err);
    }
  },
); 

export default router;