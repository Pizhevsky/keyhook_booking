import React from 'react';
import ManagerTimeSlot from './ManagerTimeSlot';
import { UserScheduleProps } from '../types';
import TimeSlotCreate from './TimeSlotCreate';

export default function ManagerSchedule({ currentDateString, dayUserSlots, allUserSlots, booksBySlotId, usersById }: UserScheduleProps) {
  
  return (
    <div className="space-y-4">
      {dayUserSlots.length
        ? dayUserSlots.map(slot => {
            const booking = booksBySlotId[slot.id];
            const tenant = booking && usersById[booking.tenantId];

            return (
              <div key={slot.id} className="p-4 rounded-lg bg-white border">
                <ManagerTimeSlot
                  slot={slot}
                  allUserSlots={allUserSlots}
                  currentDateString={currentDateString}
                  bookingId={booking?.id}
                  userName={tenant ? tenant.name : 'Manager slot'}
                />
              </div>
            );
          })
        : <div>No slots</div>
      }
      <div className="flex flex-row-reverse">
        <TimeSlotCreate currentDateString={currentDateString} allUserSlots={allUserSlots}/>
      </div>
    </div>
  );
}
