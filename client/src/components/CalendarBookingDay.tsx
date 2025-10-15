import React from 'react';
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Badge } from '@mui/material';
import { getDayOfWeek } from '../utils/time';
import { Availability, Booking } from '../types';

export default function CalendarBookingDay(props: any) {
  const { availability = [], bookings = [], day, outsideCurrentMonth, ...other } = props;
  const dayNumber = day.day() === 0 ? 7 : day.day();
  const dayString = day.format("DD/MM/YYYY");

  let badgeContent;
  if (!props.outsideCurrentMonth) {
    const slots = availability.filter((slot: Availability) => 
      slot.daysOfWeek.includes(dayNumber) || 
      slot.selectedDate === dayString
    )
    if (slots.length) {
      badgeContent = slots.filter((slot: Availability) => 
        bookings.some((book: Booking) =>
          book.slotId === slot.id &&
          book.bookDate === dayString
        )
      ).length ? '🟡' : '🟢'
    }
  }

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={badgeContent}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
};