import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteAvailability, updateAvailability } from '../api';
import { Availability } from '../types';
import TimeSlotEdit from './TimeSlotEdit';
import BookingCancel from './BookingCancel';

interface ManagerTimeSlotProps { 
  slot: Partial<Availability>;
  bookingId: number | undefined;
  userName: string;
  currentDateString: string;
}

export default function ManagerTimeSlot({ slot, bookingId, userName, currentDateString}: ManagerTimeSlotProps) {
  const [edit, setEdit] = useState(false);
  const [newSlot, setNewSlot] = useState(slot);

  useEffect(() => {
    if (bookingId) {
      setEdit(false);
    }
  }, [bookingId])

  const handleEdit = () => {
    const body = {
      ...newSlot,
      selectedDate: newSlot.selectedDate?.length === 0  && newSlot.daysOfWeek?.length === 0 
        ? currentDateString 
        : newSlot.selectedDate
    }
    setNewSlot(body);
    updateAvailability(body).then(() => {
      toast.success('Updated'); 
      setEdit(false); 
    }).catch((e) => {
      toast.error(`Failed update: ${e.response.data.error}`); 
    });
  };

  const handleDelete = () => {
    if (slot.id) {
      deleteAvailability(slot.id).then(() => {
        toast.success('Deleted'); 
        setEdit(false); 
      }).catch((e) => {
        toast.error(`Failed delete: ${e.response.data.error}`); 
      });
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between">
      <TimeSlotEdit
        edit={edit} 
        slot={newSlot} 
        userName={userName} 
        currentDateString={currentDateString} 
        onChange={newState => setNewSlot(newState)}
      />
      <div className="flex flex-col">
        {bookingId
          ? <BookingCancel bookingId={bookingId} />
          : edit
            ? <div className="flex flex-col gap-2">
                <button className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => handleEdit()}>
                  Save
                </button>
                <button className="px-3 py-1 w-20 bg-gray-200 rounded" onClick={() => setEdit(false)}>
                  Cancel
                </button>
              </div>
            : <div className="flex flex-col gap-10">
                <button className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => setEdit(true)}>
                  Edit
                </button> 
                <button className="px-3 py-1 w-20 bg-red-600 text-white rounded" onClick={() => handleDelete()}>
                  Delete
                </button> 
              </div>
          }
        </div>
    </div>
  );
}
