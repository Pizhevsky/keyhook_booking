import { Transaction } from 'sequelize';
import { Booking, Availability, User } from '../models';
import { broadcast } from '../lib/broadcast';
import { withTransaction } from '../lib/sequelize';
import { AppError, BOOKING_STATUS, DATE_FORMAT, DATETIME_FORMAT } from '../types';
import dayjs from '../lib/dayjs';
import type { BookingStatus } from '../types';
import type { CreateBookingInput } from '../middleware/validate';

export async function getAllBookings(includeAll = false) {
  const where = includeAll ? {} : { status: BOOKING_STATUS.ACTIVE };
  return Booking.findAll({ where });
}

export async function createBooking(input: CreateBookingInput) {
  const { slotId, bookDate, tenantId, tenantTimeZone } = input;

  return withTransaction(async (t: Transaction) => {
    // Invariant 4 — only tenants can book
    const tenant = await User.findOne({
      where: { id: tenantId, role: 'tenant' },
      transaction: t,
    });
    if (!tenant) throw new AppError(404, 'Tenant not found', 'TENANT_NOT_FOUND');

    const slot = await Availability.findByPk(slotId, { transaction: t });
    if (!slot) throw new AppError(404, 'Slot not found', 'SLOT_NOT_FOUND');

    // Invariant 1 — slot can actually be booked on the requested date
    assertSlotOccursOnDate(slot, bookDate);

    // Invariant 2 — slot must not be in the past
    assertNotInPast(bookDate, slot.startTime, slot.timeZone, tenantTimeZone);

    // Invariant 3 — one active booking per slot per date.
    const existing = await Booking.findOne({
      where: { slotId, bookDate, status: BOOKING_STATUS.ACTIVE },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (existing) throw new AppError(409, 'Slot is already booked for this date', 'SLOT_ALREADY_BOOKED');

    const booking = await Booking.create(
      { slotId, bookDate, tenantId, status: BOOKING_STATUS.ACTIVE },
      { transaction: t },
    );

    broadcast({ type: 'BOOKING_CREATED', payload: booking.toJSON() });
    return booking;
  });
}

// Soft cancellation — invariants 4 and 5 enforced here
export async function cancelBooking(bookingId: number, requestingUserId: number) {
  return withTransaction(async (t: Transaction) => {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');

    // Invariant 6 — cannot cancel twice
    if (booking.status !== BOOKING_STATUS.ACTIVE) {
      throw new AppError(409, `Booking is already ${booking.status}`, 'BOOKING_ALREADY_CANCELLED');
    }

    const requestingUser = await User.findByPk(requestingUserId, { transaction: t });
    if (!requestingUser) throw new AppError(404, 'Requesting user not found', 'REQUESTING_USER_NOT_FOUND');

    // Invariant 5 — tenants can only cancel their own bookings
    if (requestingUser.role === 'tenant' && booking.tenantId !== requestingUserId) {
      throw new AppError(403, 'Tenants can only cancel their own bookings', 'FORBIDDEN');
    }

    const newStatus: BookingStatus = requestingUser.role === 'manager'
      ? BOOKING_STATUS.CANCELLED_BY_MANAGER
      : BOOKING_STATUS.CANCELLED_BY_TENANT;

    await booking.update(
      { status: newStatus, cancelledAt: new Date() },
      { transaction: t },
    );

    broadcast({ type: 'BOOKING_CANCELLED', payload: booking.toJSON() });
    return booking;
  });
}

// Invariant 2 helper
export function assertNotInPast(
  bookDate: string,
  startTime: string,
  slotTimezone: string,
  tenantTimeZone?: string,
): void {
  if (!tenantTimeZone) return;

  try {
    const slotStart = dayjs.tz(`${bookDate} ${startTime}`, DATETIME_FORMAT, slotTimezone);
    if (!slotStart.isValid()) return;

    const nowInTenantTz = dayjs().tz(tenantTimeZone);
    if (slotStart.isBefore(nowInTenantTz)) {
      throw new AppError(400, 'Slot is in the past for tenant timezone', 'SLOT_IN_PAST');
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
  }
}

// Invariant 1 helper
export function assertSlotOccursOnDate(slot: Availability, bookDate: string): void {
  if (slot.selectedDate) {
    if (slot.selectedDate !== bookDate) {
      throw new AppError(400, 'Slot is not available on this date', 'SLOT_NOT_AVAILABLE_ON_DATE');
    }

    return;
  }

  const availableDays = parseDaysOfWeek(slot.daysOfWeek);
  const bookDateWeekDay = getIsoWeekDay(bookDate);

  if (!availableDays.includes(bookDateWeekDay)) {
    throw new AppError(400, 'Slot is not available on this day', 'SLOT_NOT_AVAILABLE_ON_DAY');
  }
}

function getIsoWeekDay(date: string): number {
  const day = dayjs(date, DATE_FORMAT, true).day();
  return day === 0 ? 7 : day;
}

function parseDaysOfWeek(daysOfWeek: string): number[] {
  if (!daysOfWeek.trim()) {
    return [];
  }

  return daysOfWeek
    .split(';')
    .map(Number)
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7);
}