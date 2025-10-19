import React from 'react';
import { DateCalendar } from '@mui/x-date-pickers';
import { styled } from '@mui/material';
import { Availability, Booking } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale'
import CalendarBookingDay from './CalendarBookingDay';

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1,
})

interface CalendarProps {
  date: Dayjs;
  day: {
    slots: Availability[],
    books: Booking[]
  };
  onChange: (date: Dayjs) => void;
}

const StyledDateCalendar = styled(DateCalendar)({
  '&.MuiDateCalendar-root': {
    margin: '5px',
    height: '400px',
    width: '420px',
    maxHeight: 'none',
    '& .MuiDayCalendar-weekDayLabel': {
      fontSize: '1rem',
    },
    '& .MuiPickersCalendarHeader-label': {
      fontSize: '1rem',
    },
    '& div[role="row"]': {
      justifyContent: 'space-around',
    },
    '& .MuiDayCalendar-slideTransition': {
      minHeight: '300px',
    },
    '& .MuiPickersDay-root': {
      height: '48px',
      width: '48px',
      fontSize: '1rem',
    },
  },
});

export default function Calendar({ date, day, onChange }: CalendarProps) {
  const slotProps: any = { day };

  const handleChange = (value: Dayjs | null) => {
    if (value) {
      onChange(value);
    }
  };

  return (
    <StyledDateCalendar 
      value={date} 
      onChange={handleChange}
      slots={{ day: CalendarBookingDay }}
      slotProps={slotProps}
    />
  );
}
