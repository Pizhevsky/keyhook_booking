import axios from 'axios';
import { Availability } from './types';

export const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export const getUsers = async () => 
  (await api.get('/users')).data;

export const createUser = async (name: string, role: string) => 
  (await api.post('/users', { name, role })).data;

export const getAvailability = async () => 
  (await api.get('/availability')).data;

export const getBookings = async () => 
  (await api.get('/bookings')).data;

export const bookSlot = async (slotId: number, bookDate: string, tenantId: number, tenantTimezone: string) => 
  (await api.post('/book', { slotId, bookDate, tenantId, tenantTimezone })).data;

export const deleteBooking = async (bookingId: number) => 
  (await api.delete(`/book/${bookingId}`)).data;

export const addAvailability = async (slot: Partial<Availability>) => 
  (await api.post('/availability', { ...slot, daysOfWeek: slot.daysOfWeek?.join(';') || '' })).data;

export const updateAvailability = async (slot: Partial<Availability>) => 
  (await api.put(`/availability/${slot.id}`, { ...slot, daysOfWeek: slot.daysOfWeek?.join(';') || '' })).data;

export const deleteAvailability = async (slotId: number) => 
  (await api.delete(`/availability/${slotId}`)).data;
