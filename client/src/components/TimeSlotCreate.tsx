import React, { useContext, useEffect, useState } from 'react';
import { Availability, defaultAvailability } from '../types';
import { getIntersectionsList, localTZ } from '../utils/time';
import TimeSlotEdit from './TimeSlotEdit';
import { addAvailability } from '../api';
import toast from 'react-hot-toast';
import { UserContext } from '../contexts/UserContext';

interface TimeSlotCreateProps {
  currentDateString: string;
  allUserSlots: Availability[];
}

const defaultSlot: defaultAvailability = {
  daysOfWeek: [],
  selectedDate: '',
  startTime: '12:00',
  endTime: '13:00'
}

export default function TimeSlotCreate({ currentDateString, allUserSlots }: TimeSlotCreateProps) {
  const { user } = useContext(UserContext);
  const [edit, setEdit] = useState(false);
  const [slot, setSlot] = useState(defaultSlot);

  useEffect(() => {
    handleCancel();
  }, [currentDateString]);

  const handleCancel = () => {
    setEdit(false);
    setSlot(defaultSlot);
  }
  
  const handleCreate = () => {
    const body = {
      ...slot,
      managerId: user.id,
      timezone: localTZ,
      selectedDate: !slot.selectedDate && slot.daysOfWeek?.length === 0 
          ? currentDateString 
          : slot.selectedDate
    };

    const intersectionsList = getIntersectionsList(body, allUserSlots);
    if (intersectionsList.length) {
      toast.error(`Time slot ${body.startTime}-${body.endTime}\nhas intersections on:\n\n${intersectionsList.join(', ')}`);
      return;
    }

    addAvailability(body).then(() => {
      toast.success('Created'); 
      setEdit(false); 
      setSlot(defaultSlot);
    }).catch((e) => {
      toast.error(`Failed create: ${e.response.data.error}`); 
    });
  };
  
  return (edit
    ? <div className="p-4 flex-grow rounded-lg bg-white border">
        <div className="flex flex-wrap items-start justify-between justify-items-stretch">
          <TimeSlotEdit 
            edit={true}
            slot={slot}
            currentDateString={currentDateString}
            userName={'Manager slot'}
            onChange={newState => setSlot(newState)}
          />
          <div className="flex flex-col gap-2">
            <button className="px-3 py-1 w-20 bg-blue-600 text-white rounded" onClick={() => handleCreate()}>
              Save
            </button>
            <button className="px-3 py-1 w-20 bg-gray-200 rounded" onClick={() => handleCancel()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    : <button className="px-3 py-1 rounded bg-green-600 text-white mt-4 mr-3" onClick={() => setEdit(true)}>
        {'Add Slot'}
      </button>
  );
}
