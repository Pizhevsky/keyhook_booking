import { Transaction } from 'sequelize';
import { Availability, Booking, User } from '../models';
import { broadcast } from '../lib/broadcast';
import { withTransaction } from '../lib/sequelize';
import { AppError, BOOKING_STATUS } from '../types';
import type {  
  CreateAvailabilityInput, 
  UpdateAvailabilityInput 
} from '../middleware/validate';
import type { AvailabilityAttributes } from '../models';

export async function getAllAvailability() {
  return Availability.findAll();
}

export async function createAvailability(input: CreateAvailabilityInput): Promise<Availability> {
  const { managerId, selectedDate = '', daysOfWeek = '', startTime, endTime, timezone } = input;

  const manager = await User.findOne({ where: { id: managerId, role: 'manager' } });
  if (!manager) throw new AppError(404, 'Manager not found', 'MANAGER_NOT_FOUND');

  const duplicate = await Availability.findOne({
    where: { managerId, selectedDate, daysOfWeek, startTime, endTime },
  });
  if (duplicate) throw new AppError(409, 'Duplicate slot', 'DUPLICATE_SLOT');

  const created = await Availability.create({
    managerId, selectedDate, daysOfWeek, startTime, endTime, timezone,
  });

  broadcast({ type: 'AVAILABILITY_CREATED', payload: created.toJSON() });
  return created;
}

export async function updateAvailability(id: number, input: UpdateAvailabilityInput): Promise<Availability> {
  const slot = await Availability.findByPk(id);
  if (!slot) throw new AppError(404, 'Slot not found', 'SLOT_NOT_FOUND');

  if (input.managerId !== undefined) {
    const manager = await User.findByPk(input.managerId);
    if (!manager || manager.role !== 'manager') {
      throw new AppError(403, 'Only managers can edit availability', 'FORBIDDEN');
    }
  }

  await slot.update({
    selectedDate: input.selectedDate ?? slot.selectedDate,
    daysOfWeek: input.daysOfWeek ?? slot.daysOfWeek,
    startTime: input.startTime ?? slot.startTime,
    endTime: input.endTime ?? slot.endTime,
    timezone: input.timezone ?? slot.timezone,
  });

  broadcast({ type: 'AVAILABILITY_UPDATED', payload: slot.toJSON() });
  return slot;
}

export async function deleteAvailability(id: number, managerId: number): Promise<AvailabilityAttributes> {
  return withTransaction(async (t: Transaction) => {
    const slot = await Availability.findByPk(id, { transaction: t });
    if (!slot) throw new AppError(404, 'Slot not found', 'SLOT_NOT_FOUND');

    await assertManagerOwnsSlot(slot, managerId, t);
    await assertNoActiveBookings(id, t);

    const payload = slot.toJSON();
    await slot.destroy({ transaction: t });

    broadcast({ type: 'AVAILABILITY_DELETED', payload });
    return payload;
  });
}

// Helpers for enforcing invariants related to availability changes

async function assertManagerOwnsSlot(slot: Availability, managerId: number, transaction: Transaction): Promise<void> {
  const manager = await User.findOne({
    where: { id: managerId, role: 'manager' },
    transaction,
  });

  if (!manager) {
    throw new AppError(403, 'Only managers can change availability', 'MANAGER_NOT_FOUND');
  }

  if (slot.managerId !== managerId) {
    throw new AppError(403, 'Managers can only change their own availability', 'MANAGER_CANNOT_CHANGE_OTHER_AVAILABILITY');
  }
}

async function assertNoActiveBookings(slotId: number, transaction: Transaction): Promise<void> {
  const activeBooking = await Booking.findOne({
    where: { slotId, status: BOOKING_STATUS.ACTIVE },
    transaction,
  });

  if (activeBooking) {
    throw new AppError(409, 'Cannot delete availability with active bookings', 'AVAILABILITY_HAS_ACTIVE_BOOKINGS');
  }
}
