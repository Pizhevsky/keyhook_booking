import React from 'react';
import { deleteBooking } from '../api';
import toast from 'react-hot-toast';

export default function BookingCancel({ bookingId, canCancel }: { bookingId: number, canCancel: boolean }) {
  
  const handleCancel = () => {
    if (bookingId) {
      deleteBooking(bookingId).then(() => {
        toast.success('Cancelled');
      }).catch((e) => {
        toast.error(`Failed to cancel: ${e.response.data.error}`); 
      });
    } else {
      toast.error('Booking Id not found'); 
    }
  }

  return (
    <div className="flex flex-row-reverse lg:flex-col items-center gap-2">
      {canCancel
        ? <button className="px-3 py-1 rounded bg-gray-300" onClick={() => handleCancel()}>
            Cancel
          </button>
        : <></>
      }
      <span className="px-3 py-1 text-red-600 rounded">Booked</span>
    </div>
  );
}
