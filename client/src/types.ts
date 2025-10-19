export type Role = 'tenant' | 'manager'

export interface User {
  id: number
  name: string
  role: Role
}

export interface Availability {
  id: number
  managerId: number
  daysOfWeek: Array<number>
  selectedDate: string 
  startTime: string
  endTime: string
  timezone: string
}

export interface Booking {
  id: number
  slotId: number
  tenantId: number
  bookDate: string
  createdAt: string
}

export interface AppState { 
  users: User[]
  availability: Availability[]
  bookings: Booking[]
}

type UsersObj = {
  [key: string]: User
}

type BooksObj = {
  [key: string]: Booking
}
export interface UserScheduleProps {
  currentDateString: string
  dayUserSlots: Availability[]
  allUserSlots: Availability[]
  usersById: UsersObj
  booksBySlotId: BooksObj
}

export type defaultAvailability = {
  id?: number
  daysOfWeek: Array<number>
    selectedDate: string
  startTime: string
  endTime: string
}