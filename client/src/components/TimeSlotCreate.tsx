import { useState } from 'react';
import { getIntersectionsList, localTZ } from '../utils/time';
import TimeSlotEdit from './TimeSlotEdit';
import { createAvailability } from '../services/apiService';
import { handleApiAction, showErrorToast } from '../services/errorService';
import { useUser } from '../contexts/UserContext';
import { addAvailability, useAppDispatch } from '../store';
import type { Availability, AvailabilityDraft, ServerAvailability } from '../types';
import { mapServerAvailability } from '../utils/transforms';

interface TimeSlotCreateProps {
  currentDateString: string
  allUserSlots: Availability[]
}

const defaultSlot: AvailabilityDraft = {
  id: undefined,
  daysOfWeek: [],
  selectedDate: '',
  startTime: '12:00',
  endTime: '13:00'
}

export default function TimeSlotCreate({ currentDateString, allUserSlots }: TimeSlotCreateProps) {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const [edit, setEdit] = useState(false);
  const [slot, setSlot] = useState<AvailabilityDraft>(defaultSlot);

  const handleCancel = () => {
    setEdit(false);
    setSlot(defaultSlot);
  }
  
  const handleCreate = async () => {
    if (!user) return;

    const body = {
      ...slot,
      managerId: user.id,
      timeZone: localTZ,
      selectedDate: !slot.selectedDate && slot.daysOfWeek?.length === 0 
          ? currentDateString 
          : slot.selectedDate
    };

    const intersectionsList = getIntersectionsList(body, allUserSlots);
    if (intersectionsList.length) {
      showErrorToast(`
        Time slot ${body.startTime}-${body.endTime}\n
        has intersections on:\n\n
        ${intersectionsList.join('\n')}
      `);
      return;
    }

    const result = await handleApiAction(
      () =>  createAvailability(body),
      {
        successMessage: 'Slot created',
        errorMessage: 'Failed to create slot',
        logLabel: 'Create slot failed',
      },
    );

    if (result.ok) {
      handleCancel();
      dispatch(addAvailability(mapServerAvailability(result.data as ServerAvailability)));
    }
  };
  
  return (edit
    ? <div className="p-4 flex-grow rounded-lg bg-white border">
        <div className="flex flex-wrap items-start justify-between justify-items-stretch">
          <TimeSlotEdit 
            edit
            slot={slot}
            currentDateString={currentDateString}
            userName={user?.name || 'Manager slot'}
            onChange={setSlot}
          />
          <div className="flex flex-col gap-2">
            <button type="button" className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={handleCreate}>
              Save
            </button>
            <button type="button" className="px-3 py-1 w-20 bg-gray-200 rounded" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    : <button type="button" className="px-3 py-1 rounded bg-green-600 text-white mt-4 mr-3" onClick={() => setEdit(true)}>
        Add Slot
      </button>
  );
}
