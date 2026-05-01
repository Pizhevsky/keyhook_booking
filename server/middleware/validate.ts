import { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { AppError, UserRole, DATE_FORMAT } from '../types';
import dayjs from '../lib/dayjs';

// Body interfaces

export interface CreateUserBody { 
  name?: string
  role?: UserRole
}

export interface CreateAvailabilityBody {
  managerId: number
  selectedDate?: string
  daysOfWeek?: string
  startTime: string
  endTime: string
  timezone: string
}

export interface UpdateAvailabilityBody {
  managerId?: number
  selectedDate?: string
  daysOfWeek?: string
  startTime?: string
  endTime?: string
  timezone?: string
}

export interface CreateBookingBody {
  slotId?: number
  bookDate?: string
  tenantId?: number
  tenantTimezone?: string
}

// Input interfaces

export interface CreateUserInput {
  name: string
  role: UserRole
}

export interface CreateAvailabilityInput {
  managerId: number
  selectedDate?: string
  daysOfWeek?: string
  startTime: string
  endTime: string
  timezone: string
}

export interface UpdateAvailabilityInput {
  managerId?: number
  selectedDate?: string
  daysOfWeek?: string
  startTime?: string
  endTime?: string
  timezone?: string
}

export interface CreateBookingInput {
  slotId: number
  bookDate: string
  tenantId: number
  tenantTimezone?: string
}

// Helpers

function isNonEmptyString(v: string | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInt(v: number | undefined): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

function isHHmm(v: string | undefined): v is string {
  return typeof v === 'string' && /^\d{2}:\d{2}$/.test(v);
}

function isValidDate(v: string): boolean {
  return dayjs(v, DATE_FORMAT, true).isValid();
}

function isValidDaysOfWeek(v: string): boolean {
  if (!v.trim()) {
    return false;
  }

  return v
    .split(';')
    .every((day) => /^[1-7]$/.test(day));
}

function isValidTimezone(timezone: string): boolean {
  try {
    return dayjs.tz(new Date(), timezone).isValid();
  } catch {
    return false;
  }
}

function assertStartBeforeEnd(start: string, end: string): void {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  if (toMinutes(start) >= toMinutes(end)) {
    throw new AppError(400, 'endTime must be later than startTime on the same day', 'INVALID_TIME_RANGE');
  }
}

// Infrastructure

export type ValidatedLocals<Input> = { validatedBody: Input };

type ValidatingRequestHandler<RawBody extends object, Input extends object> = (
  req:  Request<ParamsDictionary, unknown, RawBody>,
  res:  Response<unknown, ValidatedLocals<Input>>,
  next: NextFunction,
) => void;

function validateWith<RawBody extends object, Input extends object>(
  fn: (body: RawBody) => Input,
): ValidatingRequestHandler<RawBody, Input> {
  return (req, res, next) => {
    try {
      res.locals.validatedBody = fn(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Validators

export const validateCreateUser = validateWith<CreateUserBody, CreateUserInput>(
  ({ name, role }) => {
    if (!isNonEmptyString(name))
      throw new AppError(400, 'name is required and must be a non-empty string', 'INVALID_NAME');

    if (name.length > 200)
      throw new AppError(400, 'name must be 200 characters or fewer', 'INVALID_NAME');

    if (role !== 'tenant' && role !== 'manager')
      throw new AppError(400, 'role must be tenant or manager', 'INVALID_ROLE');

    return { name: name.trim(), role };
  },
);
 
export const validateCreateAvailability = validateWith<CreateAvailabilityBody, CreateAvailabilityInput>(
  ({ managerId, selectedDate, daysOfWeek, startTime, endTime, timezone }) => {
    if (!isPositiveInt(managerId))
      throw new AppError(400, 'managerId must be a positive integer', 'INVALID_MANAGER_ID');

    if (!isHHmm(startTime))
      throw new AppError(400, 'startTime must be in HH:mm format', 'INVALID_START_TIME');

    if (!isHHmm(endTime))
      throw new AppError(400, 'endTime must be in HH:mm format', 'INVALID_END_TIME');

    if (!isNonEmptyString(timezone) || !isValidTimezone(timezone)) 
      throw new AppError(400, 'timezone must be a valid IANA timezone', 'INVALID_TIMEZONE');

    if (selectedDate && !isNonEmptyString(selectedDate) && !isValidDate(selectedDate))
        throw new AppError(400, `selectedDate must be in ${DATE_FORMAT} format`, 'INVALID_SELECTED_DATE');

    if (daysOfWeek && !isNonEmptyString(daysOfWeek) && !isValidDaysOfWeek(daysOfWeek))
        throw new AppError(400, 'daysOfWeek must contain day numbers 1-7 separated by ;', 'INVALID_DAYS_OF_WEEK');

    if (!selectedDate && !daysOfWeek)
      throw new AppError(400, 'At least one of daysOfWeek or selectedDate is required', 'MISSING_AVAILABILITY_DATE');
    
    assertStartBeforeEnd(startTime, endTime);

    return { managerId, selectedDate, daysOfWeek, startTime, endTime, timezone };
  },
);
 
export const validateUpdateAvailability = validateWith<UpdateAvailabilityBody, UpdateAvailabilityInput>(
  ({ managerId, selectedDate, daysOfWeek, startTime, endTime, timezone }) => {
    if (managerId && !isPositiveInt(managerId))
      throw new AppError(400, 'managerId must be a positive integer', 'INVALID_MANAGER_ID');

    if (startTime && !isHHmm(startTime))
      throw new AppError(400, 'startTime must be in HH:mm format', 'INVALID_START_TIME');

    if (endTime && !isHHmm(endTime))
      throw new AppError(400, 'endTime must be in HH:mm format', 'INVALID_END_TIME');

    if (timezone !== undefined && (!isNonEmptyString(timezone) || !isValidTimezone(timezone)))
        throw new AppError(400, 'timezone must be a valid IANA timezone', 'INVALID_TIMEZONE');

    if (selectedDate && !isNonEmptyString(selectedDate) && !isValidDate(selectedDate))
        throw new AppError(400, `selectedDate must be in ${DATE_FORMAT} format`, 'INVALID_SELECTED_DATE');

    if (daysOfWeek && !isNonEmptyString(daysOfWeek) && !isValidDaysOfWeek(daysOfWeek))
        throw new AppError(400, 'daysOfWeek must contain day numbers 1-7 separated by ;', 'INVALID_DAYS_OF_WEEK');
    
    if (startTime && endTime)
      assertStartBeforeEnd(startTime, endTime);

    return { managerId, selectedDate, daysOfWeek, startTime, endTime, timezone };
  },
);
 
export const validateCreateBooking = validateWith<CreateBookingBody, CreateBookingInput>(
  ({ slotId, bookDate, tenantId, tenantTimezone }) => {
    if (!isPositiveInt(slotId))
      throw new AppError(400, 'slotId must be a positive integer', 'INVALID_SLOT_ID');

    if (!isPositiveInt(tenantId))
      throw new AppError(400, 'tenantId must be a positive integer', 'INVALID_TENANT_ID');

    if (!isNonEmptyString(bookDate))
      throw new AppError(400, 'bookDate is required', 'INVALID_BOOK_DATE');

    if (!dayjs(bookDate, DATE_FORMAT, true).isValid())
      throw new AppError(400, `bookDate must be in ${DATE_FORMAT} format`, 'INVALID_BOOK_DATE');

    if (tenantTimezone && !isNonEmptyString(tenantTimezone))
      throw new AppError(400, 'tenantTimezone must be a non-empty string if provided', 'INVALID_TENANT_TIMEZONE');

    return { slotId, bookDate, tenantId, tenantTimezone };
  },
);
