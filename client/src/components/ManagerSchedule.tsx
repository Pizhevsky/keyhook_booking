import React from 'react';
import ManagerTimeSlot from './ManagerTimeSlot';
import { UserScheduleProps } from '../types';
import TimeSlotCreate from './TimeSlotCreate';
import { arrayToObjectByKey } from '../utils/transforms';

export default function ManagerSchedule({ currentDateString, users, slots, books }: UserScheduleProps) {
  const usersById = arrayToObjectByKey('id', users);
  const booksBySlotId = arrayToObjectByKey('slotId', books);

  return (
    <div className="space-y-4">
      {slots.length
        ? slots.map(slot => {
            const booking = booksBySlotId[slot.id];
            const tenant = booking && usersById[booking.tenantId];

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
      <div className="flex flex-row-reverse">
        <TimeSlotCreate currentDateString={currentDateString}/>
      </div>
    </div>
  );
}
