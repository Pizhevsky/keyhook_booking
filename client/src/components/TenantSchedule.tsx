import { Avatar } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { bookSlot } from '../services/apiService';
import { handleApiAction, showErrorToast } from '../services/errorService';
import type { Availability, ScheduleProps } from '../types';
import { useAppDispatch, addBooking } from '../store';
import { checkBookingDate, getDateByTimeZone, localTZ } from '../utils/time';
import BookingCancel from './BookingCancel';

export default function TenantSchedule({
  currentDateString,
  dayUserSlots,
  booksBySlotId,
  usersById
}: ScheduleProps) {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  
  const handleBook = async (slot: Availability) => {
    const check = checkBookingDate(currentDateString, slot.startTime, slot.timeZone);
    if (check) {
      showErrorToast(check);
      return;
    }

    if (!user) {
      showErrorToast('No user selected');
      return;
    }

    const result = await handleApiAction(
      () =>  bookSlot(slot.id, currentDateString, user.id, localTZ),
      {
        successMessage: 'Slot booked',
        errorMessage: 'Failed to book slot',
        logLabel: 'Book slot failed',
      },
    );

    if (result.ok) {
      dispatch(addBooking(result.data));
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {dayUserSlots.length
          ? dayUserSlots.map(slot => {
              const manager = usersById[slot.managerId];
              const booking = booksBySlotId[slot.id];
              const isBooked = booking?.status === 'active';
              const color = isBooked ? 'bg-gray-100' : 'bg-white';

              return (
                <div 
                  key={slot.id} 
                  className={`p-4 rounded-lg ${color} flex items-center justify-between border`}
                >
                  <div className='flex gap-2'>
                    <Avatar>{manager ? manager.name[0] : 'M'}</Avatar>
                    <div>
                      <div className="font-medium">
                        <span>{getDateByTimeZone(currentDateString, slot.startTime, slot.timeZone).format('HH:mm')}</span>
                        <span>&nbsp;-&nbsp;</span>
                        <span>{getDateByTimeZone(currentDateString, slot.endTime, slot.timeZone).format('HH:mm')}</span>
                      </div>
                      <div className="text-sm text-gray-500">{manager?.name}</div>
                    </div>
                  </div>
                  <div>
                    {isBooked
                      ? <BookingCancel 
                          bookingId={booking.id} 
                          cancelledBy={user?.id ?? 0}
                          canCancel={booking.tenantId === user?.id}
                        />
                      : <button type="button" 
                          className="px-3 py-1 rounded bg-blue-600 text-white" 
                          onClick={() => handleBook(slot)}
                        >
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
