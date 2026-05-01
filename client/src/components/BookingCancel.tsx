import { cancelBooking } from '../services/apiService';
import { handleApiAction } from '../services/errorService';
import { updateBooking, useAppDispatch } from '../store';

interface BookingCancelProps {
  bookingId: number
  cancelledBy: number
  canCancel: boolean
}

export default function BookingCancel({ bookingId, cancelledBy, canCancel }: BookingCancelProps) {
  const dispatch = useAppDispatch();
  
  const handleCancel = async () => {
    const result = await handleApiAction(
      () => cancelBooking(bookingId, cancelledBy),
      {
        successMessage: 'Booking cancelled',
        errorMessage: 'Failed to cancel booking',
        logLabel: 'Cancel booking failed',
      }
    );
    
    if (result.ok) {
      dispatch(updateBooking(result.data));
    }
  }

  return (
    <div className="flex flex-row-reverse lg:flex-col items-center gap-2">
      {canCancel && (
        <button type="button" className="px-3 py-1 rounded bg-gray-300" onClick={handleCancel}>
          Cancel
        </button>
      )}
      <span className="px-3 py-1 text-red-600 rounded">Booked</span>
    </div>
  );
}
