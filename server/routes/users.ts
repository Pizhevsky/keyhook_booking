import { Router } from 'express';
import { User } from '../models';
import { validateUser } from '../middleware/validateUser';
import { broadcast } from '../broadcast';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await User.findAll({ attributes: ['id', 'name', 'role'] });
  res.json(rows);
});

router.post('/', validateUser, async (req, res) => {
  const { name, role } = req.body;
  const user = await User.create({ name, role } as any);
  broadcast({ type: 'USER_CREATED', payload: user });
  res.status(201).json(user);
});

export default router;