import { Router } from 'express';
import { User } from '../models';
import { validateUser } from '../middleware/validateUser';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await User.findAll({ attributes: ['id', 'name', 'role'] });
  res.json(rows);
});

router.post('/', validateUser, async (req, res) => {
  const { name, role } = req.body;
  const u = await User.create({ name, role } as any);
  res.status(201).json(u);
});

export default router;