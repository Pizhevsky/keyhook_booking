import React from 'react';
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Badge } from '@mui/material';
import { Availability, Booking } from '../types';

export default function CalendarBookingDay(props: any) {
  const { slots = [], books = [], day, outsideCurrentMonth, ...other } = props;
  const dayNumber = day.day() === 0 ? 7 : day.day();
  const dayString = day.format("DD/MM/YYYY");

  let badgeContent;
  if (!props.outsideCurrentMonth) {
    const daySlots = slots.filter((slot: Availability) => 
      slot.daysOfWeek.includes(dayNumber) || 
      slot.selectedDate === dayString
    );
    if (daySlots.length) {
      const dayBooks = daySlots.filter((slot: Availability) => 
        books.some((book: Booking) =>
          book.slotId === slot.id &&
          book.bookDate === dayString
        )
      );

      let full = dayBooks.length === daySlots.length;
      let color = full ? 'bg-red-400' : (dayBooks.length ? 'bg-yellow-400' : 'bg-green-500');
      let count = full 
        ? (<span>&#10005;</span>) 
        : daySlots.length < 100 
          ? (<span>{(daySlots.length - dayBooks.length)}</span>) 
          : (<span>&infin;</span>);

      badgeContent = (
        <div className={`flex items-center justify-center w-5 h-5 ${color} rounded-full text-white text-xs mt-1`}>
          {count}
        </div>
      );
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