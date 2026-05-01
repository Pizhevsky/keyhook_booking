import axios from 'axios';
import type {
  User,
  ServerAvailability,
  Booking,
  AvailabilityDraft,
  Role
} from '../types';

const BASE_URL = process.env.API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL: BASE_URL });

type RequestOptions = {
  signal?: AbortSignal
};

// Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(options: RequestOptions = {}): Promise<User[]> {
  return (await api.get<User[]>('/users', { signal: options.signal })).data;
}

export async function createUser(name: string, role: Role): Promise<User> {
  return (await api.post<User>('/users', { name, role })).data;
}

//Availability ──────────────────────────────────────────────────────────────

export async function getAvailability(
  options: RequestOptions = {}
): Promise<ServerAvailability[]> {
  return (await api.get<ServerAvailability[]>('/availability', { signal: options.signal })).data;
}

export async function createAvailability(
  slot: AvailabilityDraft & { managerId: number; timezone: string },
): Promise<ServerAvailability> {
  return (await api.post<ServerAvailability>('/availability', {
    ...slot,
    daysOfWeek: slot.daysOfWeek.join(';'),
  })).data;
}

export async function editAvailability(
  slot: AvailabilityDraft & { managerId?: number; timezone?: string },
): Promise<ServerAvailability> {
  return (await api.put<ServerAvailability>(`/availability/${slot.id}`, {
    ...slot,
    daysOfWeek: slot.daysOfWeek.join(';'),
  })).data;
}

export async function deleteAvailability(
  slotId: number,
  managerId: number
): Promise<ServerAvailability> {
  return (await api.delete<ServerAvailability>(`/availability/${slotId}`, {
    params: { managerId },
  })).data;
}

// Bookings ──────────────────────────────────────────────────────────────────

export async function getBookings(options: RequestOptions = {}): Promise<Booking[]> {
  return (await api.get<Booking[]>('/bookings', { signal: options.signal })).data;
}

export async function bookSlot(
  slotId: number, 
  bookDate: string, 
  tenantId: number, 
  tenantTimezone: string
): Promise<Booking> {
  return (await api.post<Booking>('/book', { slotId, bookDate, tenantId, tenantTimezone })).data;
}

export async function cancelBooking(bookingId: number, cancelledBy: number): Promise<Booking> {
  return (await api.delete<Booking>(`/book/${bookingId}`, {
    params: { cancelledBy },
  })).data;
}
