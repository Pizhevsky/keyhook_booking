import { Badge } from '@mui/material';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import type { ReactNode } from 'react';
import type { Dayjs } from '../lib/dayjs';
import type { Availability, Booking } from '../types';
import { DATE_FORMAT } from '../utils/time';

interface CalendarBookingDayProps extends PickersDayProps {
  day: Dayjs
  slots?: Availability[]
  books?: Booking[]
}

export default function CalendarBookingDay({ 
  day,
  slots = [],
  books = [],
  outsideCurrentMonth,
  ...other
}: CalendarBookingDayProps) {
  const dayNumber = day.day() === 0 ? 7 : day.day();
  const dayString = day.format(DATE_FORMAT);

  let badgeContent: ReactNode = null;

  if (!outsideCurrentMonth) {
    const daySlots = slots.filter((slot: Availability) => 
      slot.daysOfWeek.includes(dayNumber) || 
      slot.selectedDate === dayString
    );
    if (daySlots.length > 0) {
      const dayBooks = daySlots.filter((slot: Availability) => 
        books.some((book: Booking) =>
          book.slotId === slot.id &&
          book.bookDate === dayString &&
          book.status === 'active'
        )
      );

      const available = daySlots.length - dayBooks.length;
      const isFull = available === 0;
      const color = isFull 
        ? 'bg-red-400'
        : dayBooks.length > 0
          ? 'bg-yellow-400'
          : 'bg-green-500';

      badgeContent = (
        <div className={`flex items-center justify-center w-5 h-5 ${color} rounded-full text-white text-xs mt-1`}>
          {isFull
            ? <span>&#10005;</span>
            : <span>{available < 100 ? available : '∞'}</span>
          }
        </div>
      );
    }
  }

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={badgeContent}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
};