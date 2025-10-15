import { Router } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Booking, Availability, User } from '../models';
import { broadcast } from '../broadcast';
import sequelize from '../sequelize';

dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();

router.get('/', async (req, res) => {
  const rows = await Booking.findAll();
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { slotId, bookDate, tenantId, tenantTimezone } = req.body;
  if (!bookDate || !slotId || !tenantId) return res.status(400).json({ error: 'date, slotId and tenantId required' });

  const tenant = await User.findOne({ where: { id: tenantId, role: 'tenant' } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const slot = await Availability.findByPk(slotId);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  try {
    const tenantDate = `${bookDate} ${slot.startTime}`;
    const tenantStart = dayjs(tenantDate, "DD/MM/YYYY HH:mm").tz(tenantTimezone);
    if (tenantStart.isBefore(dayjs().tz(slot.timeZone))) { 
      return res.status(400).json({ error: 'Slot is in the past for tenant timezone' });
    }
  } catch (e) {
    console.warn('timezone check failed', e);
  }

  const t = await sequelize.transaction();
  try {
    const existing = await Booking.findOne({ where: { slotId, bookDate, tenantId }, transaction: t, lock: t.LOCK.UPDATE });
    if (existing) { 
      await t.rollback(); 
      return res.status(409).json({ error: 'Slot already booked' }); 
    }
    
    const booking = await Booking.create({ slotId, bookDate, tenantId }, { transaction: t });
    await t.commit();
    
    const full = await Booking.findByPk(booking.id);
    if (!full) { 
      await t.rollback(); 
      return res.status(500).json({ error: 'Failed to load booking after creation' }); 
    }

    res.status(201).json(full);
    broadcast({ type: 'BOOKING_CREATED', payload: full });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const booking = await Booking.findByPk(id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const t = await sequelize.transaction();
  try {
    await Booking.destroy({ where: { id }, transaction: t });
    await t.commit();
    broadcast({ type: 'BOOKING_DELETED', payload: booking });
    res.json({ success: true });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;