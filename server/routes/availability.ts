import { Router } from 'express';
import { checkManagerRole } from '../middleware/checkManagerRole';
import { Availability, User } from '../models';
import { broadcast } from '../broadcast';
import sequelize from '../sequelize';

const router = Router();

router.get('/', async (req, res) => {
  const rows = await Availability.findAll();
  res.json(rows);
});

router.post('/', checkManagerRole, async (req, res) => {
  const { managerId, selectedDate, daysOfWeek, startTime, endTime, timeZone } = req.body;
  if ((!daysOfWeek && !selectedDate) || !startTime || !endTime || !timeZone) {
    return res.status(400).json({ error: 'Invalid' });
  }

  const manager = await User.findOne({ where: { id: managerId, role: 'manager' } });
  if (!manager) return res.status(404).json({ error: 'Manager not found' });

  const dup = await Availability.findOne({ where: { managerId, selectedDate, daysOfWeek, startTime, endTime } });
  if (dup) return res.status(409).json({ error: 'Duplicate slot' });

  const created = await Availability.create({ managerId, selectedDate, daysOfWeek, startTime, endTime, timeZone });

  broadcast({ type: 'AVAILABILITY_CREATED', payload: created });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { managerId, selectedDate, daysOfWeek, startTime, endTime, timeZone } = req.body;

  const slot = await Availability.findByPk(id);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  if (managerId) {
    const manager = await User.findByPk(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(403).json({ error: 'Only managers can edit availability' });
    }
  }

  await slot.update({
    selectedDate: selectedDate, 
    daysOfWeek: daysOfWeek,
    startTime: startTime || slot.startTime, 
    endTime: endTime || slot.endTime, 
    timeZone: timeZone || slot.timeZone 
  });
  const updated = await Availability.findByPk(id);

  broadcast({ type: 'AVAILABILITY_UPDATED', payload: updated });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const slot = await Availability.findByPk(id);
  if (!slot) return res.status(404).json({ error: 'Booking not found' });

  const t = await sequelize.transaction();
  try {
    await Availability.destroy({ where: { id }, transaction: t });
    await t.commit();
    broadcast({ type: 'AVAILABILITY_DELETED', payload: slot });
    res.json({ success: true });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;