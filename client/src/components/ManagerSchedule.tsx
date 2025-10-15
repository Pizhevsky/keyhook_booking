import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Dayjs } from 'dayjs';
import { getDayOfWeek, localTZ } from '../utils/time';
import ManagerTimeSlot from './ManagerTimeSlot';
import ManagerTimeSlotEdit from './ManagerTimeSlotEdit';
import { addAvailability } from '../api';
import { Availability, User } from '../types';
import toast from 'react-hot-toast';

const defaultSlot: Partial<Availability> = {
  daysOfWeek: [],
  selectedDate: '',
  startTime: '12:00',
  endTime: '13:00',
  timeZone: localTZ
}

export default function ManagerSchedule({ date, currentUser }: { date: Dayjs; currentUser: User }){
  const { users, availability, bookings } = useSelector((state: RootState) => state.app);
  const [edit, setEdit] = useState(false);
  const [slot, setSlot] = useState({ managerId: currentUser.id, ...defaultSlot });

  useEffect(() => {
    currentUser
    setSlot(prev => ({
      ...prev,
      managerId: currentUser.id,
    }));
  }, [currentUser])

  const selectedDay = getDayOfWeek(date);
  const currentDateString = date.format("DD/MM/YYYY");
  const slots = availability.filter(item => 
    item.managerId === currentUser.id && (
    item.daysOfWeek.includes(selectedDay) ||
    item.selectedDate === currentDateString)
  ).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const bookingsForDay = bookings.filter(item => 
    item.bookDate === currentDateString
  );
  
  const handleCreate = () => {
    const fix = {
      ...slot,
      selectedDate: !slot.selectedDate && slot.daysOfWeek?.length === 0 
          ? currentDateString 
          : slot.selectedDate
    }
    addAvailability(fix).then(() => {
      toast.success('Created'); 
      setEdit(false); 
    }).catch((e) => {
      toast.error(`Failed create: ${e.response.data.error}`); 
    });
  };

  return (
    <div className="space-y-4">
      {slots.length
        ? slots.map(slot => {
            const booking = bookingsForDay.find(book => book.slotId === slot.id);
            const tenant = booking 
              ? users.find(user => user.id === booking.tenantId)
              : undefined;

            return (
              <div key={slot.id} className="pt-4 px-4 rounded-lg bg-white border">
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
      {edit
        ? <div className="pt-4 px-4 rounded-lg bg-white border">
            <div className="flex flex-wrap items-start justify-between justify-items-stretch">
              <ManagerTimeSlotEdit 
                edit={true}
                slot={defaultSlot}
                currentDateString={currentDateString}
                userName={'Manager slot'}
                onChange={slot => setSlot(prev => ({
                  ...prev,
                  ...slot
                }))}
              />
              <div className="flex mb-4">
                <button className="ml-2 px-3 py-1 bg-gray-200 rounded" onClick={() => setEdit(false)}>
                  Cancel
                </button>
                <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleCreate()}>
                  Save
                </button>
              </div>
            </div>
          </div>
        : <button className={`px-3 py-1 rounded bg-green-600 text-white`} onClick={() => setEdit(true)}>
            {'Add Slot'}
          </button>
      }
    </div>
  );
}
