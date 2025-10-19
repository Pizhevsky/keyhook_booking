import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import { checkBookingDate, getDateByTimezone, localTZ } from '../utils/time';
import { bookSlot } from '../api';
import { Availability, UserScheduleProps } from '../types';
import { Avatar } from '@mui/material';
import { UserContext } from '../contexts/UserContext';
import BookingCancel from './BookingCancel';

export default function TenantSchedule({ currentDateString, dayUserSlots, booksBySlotId, usersById }: UserScheduleProps) {
  const { user } = useContext(UserContext);
  
  const handleBook = (slot: Availability) => {
    const check = checkBookingDate(currentDateString, slot.startTime, slot.timezone);
    if (check) {
      toast.error(check);
      return;
    }
    bookSlot(slot.id, currentDateString, user.id, localTZ).then(() => {
      toast.success('Booked');
    }).catch((e) => {
      toast.error(`Booking failed: ${e.response.data.error}`); 
    });
  };

  return (
    <div>
      <div className="space-y-4">
        {dayUserSlots.length
          ? dayUserSlots.map(slot => {
              const manager = usersById[slot.managerId];
              const booking = booksBySlotId[slot.id];

              return (
                <div key={slot.id} className={`p-4 rounded-lg ${booking ? 'bg-gray-100' : 'bg-white'} flex items-center justify-between border`}>
                  <div className='flex gap-2'>
                    <Avatar>{manager ? manager.name[0] : 'M'}</Avatar>
                    <div>
                      <div className="font-medium">
                        <span>{getDateByTimezone(currentDateString, slot.startTime, slot.timezone).format('HH:mm')}</span>
                        <span>&nbsp;-&nbsp;</span>
                        <span>{getDateByTimezone(currentDateString, slot.endTime, slot.timezone).format('HH:mm')}</span>
                      </div>
                      <div className="text-sm text-gray-500">{manager?.name}</div>
                    </div>
                  </div>
                  <div>
                    {booking
                      ? <BookingCancel bookingId={booking.id} canCancel={booking.tenantId === user.id}/>
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
