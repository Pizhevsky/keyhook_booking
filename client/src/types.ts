export type Role = 'tenant' | 'manager';

export interface User {
  id: number;
  name: string;
  role: Role;
}

export interface Availability {
  id: number;
  managerId: number;
  daysOfWeek: Array<number>;
  selectedDate: string; 
  startTime: string;
  endTime: string;
  timeZone: string;
}

export interface Booking {
  id: number;
  slotId: number;
  tenantId: number;
  bookDate: string;
  createdAt: string;
}

export interface AppState { 
  users: User[];
  currentUserId: number;
  availability: Availability[];
  bookings: Booking[];
}
