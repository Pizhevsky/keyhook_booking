import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteAvailability, deleteBooking, updateAvailability } from '../api';
import { Availability } from '../types';
import ManagerTimeSlotEdit from './ManagerTimeSlotEdit';

interface ManagerTimeSlotProps { 
  slot: Partial<Availability>;
  bookingId: number | undefined;
  userName: string;
  currentDateString: string;
}

export default function ManagerTimeSlot({ slot, bookingId, userName, currentDateString}: ManagerTimeSlotProps) {
  const [edit, setEdit] = useState(false);
  const [newSlot, setNewSlot] = useState(slot);

  const handleCancel = (bookingId: number | undefined) => {
    if (bookingId) {
      deleteBooking(bookingId).then(() => {
        toast.success('Cancelled'); 
      }).catch((e) => { 
        toast.error(`Failed to cancel: ${e.response.data.error}`); 
      });
    } else {
      toast.error('Booking Id not found'); 
    }
  };

  const handleEdit = () => {
    const fix = {
      ...newSlot,
      selectedDate: !newSlot.selectedDate && newSlot.daysOfWeek?.length === 0 
        ? currentDateString 
        : newSlot.selectedDate
    }
    setNewSlot(fix);
    updateAvailability(fix).then(() => {
      toast.success('Updated'); 
      setEdit(false); 
    }).catch((e) => {
      toast.error(`Failed update: ${e.response.data.error}`); 
    });
  };

  const handleDelete = () => {
    if (newSlot.id) {
      deleteAvailability(newSlot.id).then(() => {
        toast.success('Deleted'); 
        setEdit(false); 
      }).catch((e) => {
        toast.error(`Failed delete: ${e.response.data.error}`); 
      });
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between justify-items-stretch">
      <ManagerTimeSlotEdit
        edit={edit} 
        slot={slot} 
        userName={userName} 
        currentDateString={currentDateString} 
        onChange={newSlot => setNewSlot(prev => ({
          ...prev,
          ...newSlot
        }))}
      />
      <div className="flex mb-4">
        {bookingId
          ? <>
              <span className="px-3 py-1 text-red-600 rounded">Booked</span>
              <button className="ml-2 px-3 py-1 bg-gray-200 rounded" onClick={() => handleCancel(bookingId)}>
                Cancel
              </button>
            </>
          : edit
            ? <>
                <button className="ml-2 px-3 py-1 bg-gray-200 rounded" onClick={() => setEdit(false)}>
                  Cancel
                </button>
                <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleEdit()}>
                  Save
                </button>
              </>
            : <>
                <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setEdit(true)}>
                  Edit
                </button> 
                <button className="ml-2 px-3 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete()}>
                  Delete
                </button> 
              </>
          }
      </div>
    </div>
  );
}
