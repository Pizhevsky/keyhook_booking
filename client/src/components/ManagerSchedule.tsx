import React from 'react';
import ManagerTimeSlot from './ManagerTimeSlot';
import { UserScheduleProps } from '../types';
import TimeSlotCreate from './TimeSlotCreate';

export default function ManagerSchedule({ currentDateString, users, slots, books }: UserScheduleProps) {
  return (
    <div className="space-y-4">
      {slots.length
        ? slots.map(slot => {
            const booking = books.find(book => book.slotId === slot.id);
            const tenant = booking 
              ? users.find(user => user.id === booking.tenantId)
              : undefined;

            return (
              <div key={slot.id} className="p-4 rounded-lg bg-white border">
                <ManagerTimeSlot
                  slot={slot}
                  currentDateString={currentDateString}
                  bookingId={booking?.id}
                  userName={tenant ? tenant.name : 'Manager slot'}
                />
              </div>
            );
          })
        : <div>No slots</div>
      }
      <TimeSlotCreate currentDateString={currentDateString}/>
    </div>
  );
}
