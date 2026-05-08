export type Role = 'tenant' | 'manager'

export type BookingStatus =
  | 'active'
  | 'cancelled_by_tenant'
  | 'cancelled_by_manager'

export interface User {
  id: number
  name: string
  role: Role
}

export interface ServerAvailability {
  id: number
  managerId: number
  daysOfWeek: string
  selectedDate: string 
  startTime: string
  endTime: string
  timeZone: string
}

export interface Availability extends Omit<ServerAvailability, 'daysOfWeek'> {
  daysOfWeek: number[];
}

export interface AvailabilityDraft {
  id: number | undefined
  daysOfWeek: number[]
  selectedDate: string
  startTime: string
  endTime: string
}

export interface Booking {
  id: number
  slotId: number
  tenantId: number
  bookDate: string
  status: BookingStatus
  createdAt: string
  cancelledAt: string | null
}

export interface ScheduleProps {
  currentDateString: string
  dayUserSlots: Availability[]
  booksBySlotId: Record<string, Booking>
  usersById: Record<string, User>
}

export interface ManagerScheduleProps extends ScheduleProps {
  allUserSlots: Availability[]
}

export interface AppState { 
  users: User[]
  availability: Availability[]
  bookings: Booking[]
  loading: boolean
}

export type WsEvent =  
  | { type: 'USER_CREATED'; payload: User }
  | { type: 'AVAILABILITY_CREATED'; payload: ServerAvailability }
  | { type: 'AVAILABILITY_UPDATED'; payload: ServerAvailability }
  | { type: 'AVAILABILITY_DELETED'; payload: ServerAvailability }
  | { type: 'BOOKING_CREATED'; payload: Booking }
  | { type: 'BOOKING_CANCELLED'; payload: Booking };