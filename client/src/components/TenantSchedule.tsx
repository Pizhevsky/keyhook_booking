import React from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getDayOfWeek, localTZ } from '../utils/time';
import { RootState } from '../store';
import { bookSlot, deleteBooking } from '../api';
import { Availability, Booking, User } from '../types';
import { Avatar } from '@mui/material';

dayjs.extend(utc);
dayjs.extend(timezone);

const getDateByTimezone = (date: string, time: string, timezone: string) => {
  return dayjs(`${date} ${time}`, "DD/MM/YYYY HH:mm").tz(timezone)
}

export default function TenantSchedule({ date, currentUser }: { date: Dayjs; currentUser: User }) {
  const { users, availability, bookings } = useSelector((state: RootState) => state.app);
  
  const selectedDay = getDayOfWeek(date);
  const currentDateString = date.format("DD/MM/YYYY");
  const slots = availability.filter(item => 
    item.daysOfWeek.includes(selectedDay) ||
    item.selectedDate === currentDateString
  ).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const bookingsForDay = bookings.filter(item => 
    item.bookDate === currentDateString &&
    item.tenantId === currentUser.id
  );

  const handleBook = (slot: Availability) => {
    try {
      const str = `${currentDateString} ${slot.startTime}`;
      const startLocal = dayjs(str, "DD/MM/YYYY HH:mm").tz(slot.timeZone);
      if (startLocal.isBefore(dayjs().tz(localTZ))) { 
        return toast.error('Cannot book past slot in your local time'); 
      }
    } catch (e) {
        return toast.error('Time parsing error'); 
    }

    bookSlot(slot.id, currentDateString, currentUser.id, localTZ).then(() => {
      toast.success('Booked');
    }).catch((e) => {
      toast.error(`Booking failed: ${e.response.data.error}`); 
    });
  };

  const handleCancel = (booking: Booking) => {
    if (booking.id) {
      deleteBooking(booking.id).then(() => {
        toast.success('Cancelled');
      }).catch((e) => {
        toast.error(`Failed to cancel: ${e.response.data.error}`); 
      });
    } else {
      toast.error('Booking Id not found'); 
    }
  }

  return (
    <div>
      <div className="space-y-4">
        {slots.length
          ? slots.map(slot => {
              const manager = users.find(user => user.id === slot.managerId);
              const booking = bookingsForDay.find(book => book.slotId === slot.id);

              return (
                <div key={slot.id} className={`p-4 rounded-lg ${booking ? 'bg-gray-100' : 'bg-white'} flex items-center justify-between border`}>
                  <div className='flex gap-2'>
                    <Avatar>{manager ? manager.name[0] : 'M'}</Avatar>
                    <div>
                      <div className="font-medium">
                        <span>{getDateByTimezone(currentDateString, slot.startTime, slot.timeZone).format('HH:mm')}</span>
                        <span>&nbsp;-&nbsp;</span>
                        <span>{getDateByTimezone(currentDateString, slot.endTime, slot.timeZone).format('HH:mm')}</span>
                      </div>
                      <div className="text-sm text-gray-500">{manager?.name}</div>
                    </div>
                  </div>
                  <div>
                    {booking
                      ? <>
                          <span className="px-3 py-1 text-red-600 rounded">Booked</span>
                          <button className="px-3 py-1 rounded bg-gray-300" onClick={() => handleCancel(booking)}>
                            Cancel
                          </button>
                        </>
                      : <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => handleBook(slot)}>
                          Book
                        </button>
                    }
                  </div>
                </div>
              );
            })
          : <>No slots</>
        }
      </div>
    </div>
  );
}
