import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { updateAvailability } from '../api';
import { Availability, defaultAvailability } from '../types';
import TimeSlotEdit from './TimeSlotEdit';
import BookingCancel from './BookingCancel';
import { getIntersectionsList } from '../utils/time';
import TimeSlotDelete from './TimeSlotDelete';

interface ManagerTimeSlotProps { 
  slot: defaultAvailability;
  allUserSlots: Availability[];
  bookingId: number | undefined;
  userName: string;
  currentDateString: string;
}

export default function ManagerTimeSlot({ slot, allUserSlots, bookingId, userName, currentDateString}: ManagerTimeSlotProps) {
  const [edit, setEdit] = useState(false);
  const [newSlot, setNewSlot] = useState(slot);

  useEffect(() => {
    if (bookingId) {
      setEdit(false);
    }
  }, [bookingId]);

  const handleEdit = () => {
    const body = {
      ...newSlot,
      selectedDate: newSlot.selectedDate?.length === 0  && newSlot.daysOfWeek?.length === 0 
        ? currentDateString 
        : newSlot.selectedDate
    }

    const intersectionsList = getIntersectionsList(body, allUserSlots);
    if (intersectionsList.length) {
      toast.error(`Time slot ${body.startTime}-${body.endTime}\nhas intersections on:\n\n${intersectionsList.join('\n')}`);
      return;
    }

    setNewSlot(body);
    updateAvailability(body).then(() => {
      toast.success('Updated'); 
      setEdit(false); 
    }).catch((e) => {
      toast.error(`Failed update: ${e.response.data.error}`); 
    });
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <TimeSlotEdit
        edit={edit} 
        slot={newSlot} 
        userName={userName} 
        currentDateString={currentDateString} 
        onChange={newState => setNewSlot(newState)}
      />
      <div className="flex flex-col">
        {bookingId
          ? <BookingCancel bookingId={bookingId} canCancel={true} />
          : edit
            ? <div className="flex flex-row-reverse lg:flex-col gap-2">
                <button className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => handleEdit()}>
                  Save
                </button>
                <button className="px-3 py-1 w-20 bg-gray-200 rounded" onClick={() => { setEdit(false); setNewSlot(slot); }}>
                  Cancel
                </button>
              </div>
            : <div className="flex flex-row-reverse lg:flex-col gap-2">
                <button className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => setEdit(true)}>
                  Edit
                </button> 
                <TimeSlotDelete slotId={slot.id} onDelete={() => setEdit(false)}/> 
              </div>
          }
        </div>
    </div>
  );
}
