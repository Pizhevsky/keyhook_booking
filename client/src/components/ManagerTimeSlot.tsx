import { useState } from 'react';
import { editAvailability } from '../services/apiService';
import { handleApiAction, showErrorToast } from '../services/errorService';
import type { Availability, AvailabilityDraft, ServerAvailability } from '../types';
import { getIntersectionsList } from '../utils/time';
import BookingCancel from './BookingCancel';
import TimeSlotDelete from './TimeSlotDelete';
import TimeSlotEdit from './TimeSlotEdit';
import { mapServerAvailability } from '../utils/transforms';
import { updateAvailability, useAppDispatch } from '../store';

interface ManagerTimeSlotProps {
  slot: Availability
  allUserSlots: Availability[]
  bookingId?: number
  managerId?: number
  userName: string
  currentDateString: string
}

export default function ManagerTimeSlot({ 
  slot, 
  allUserSlots, 
  bookingId, 
  managerId, 
  userName, 
  currentDateString
}: ManagerTimeSlotProps) {
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<AvailabilityDraft>(slot);

  const handleEdit = async () => {
    const body = {
      ...draft,
      selectedDate: !draft.selectedDate && draft.daysOfWeek.length === 0 
        ? currentDateString 
        : draft.selectedDate
    }

    const intersectionsList = getIntersectionsList(body, allUserSlots);
    if (intersectionsList.length) {
      showErrorToast(`
        Time slot ${body.startTime}-${body.endTime}\n
        has intersections on:\n\n
        ${intersectionsList.join('\n')}
      `);
      return;
    }

    setDraft(body);

    const result = await handleApiAction(
      () =>  editAvailability(body),
      {
        successMessage: 'Slot updated',
        errorMessage: 'Failed to update slot',
        logLabel: 'Update slot failed',
      },
    );

    if (result.ok) {
      setEdit(false);
      dispatch(updateAvailability(mapServerAvailability(result.data as ServerAvailability)));
    }
  };

  const handleCancelEdit = () => { setEdit(false); setDraft(slot); };

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <TimeSlotEdit
        edit={edit} 
        slot={draft} 
        userName={userName}
        currentDateString={currentDateString} 
        onChange={newState => setDraft(newState)}
      />
      <div className="flex flex-col">
        {bookingId
          ? managerId && (<BookingCancel 
              bookingId={bookingId}
              cancelledBy={managerId}
              canCancel
            />)
          : edit
            ? <div className="flex flex-row-reverse lg:flex-col gap-2">
                <button type="button" className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={handleEdit}>
                  Save
                </button>
                <button type="button" className="px-3 py-1 w-20 bg-gray-200 rounded" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            : <div className="flex flex-row-reverse lg:flex-col gap-2">
                <button type="button" className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => setEdit(true)}>
                  Edit
                </button> 
                {managerId && (<TimeSlotDelete slotId={slot.id} managerId={managerId} onDelete={() => setEdit(false)}/>)}
              </div>
          }
        </div>
    </div>
  );
}
