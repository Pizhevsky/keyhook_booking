import type {
  AvailabilityAttributes,
  BookingAttributes,
  UserAttributes,
} from '../models';

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

export type UserRole = 'tenant' | 'manager';

export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CANCELLED_BY_TENANT: 'cancelled_by_tenant',
  CANCELLED_BY_MANAGER: 'cancelled_by_manager',
} as const;
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export type WsEventPayloadMap = {
  USER_CREATED: UserAttributes;

  AVAILABILITY_CREATED: AvailabilityAttributes;
  AVAILABILITY_UPDATED: AvailabilityAttributes;
  AVAILABILITY_DELETED: AvailabilityAttributes;

  BOOKING_CREATED: BookingAttributes;
  BOOKING_CANCELLED: BookingAttributes;
};

export type WsEventType = keyof WsEventPayloadMap;

export type WsEvent = {
  [Type in WsEventType]: {
    type: Type;
    payload: WsEventPayloadMap[Type];
  };
}[WsEventType];

// Operational error
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = 'APP_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}
