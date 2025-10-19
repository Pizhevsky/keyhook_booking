import React, { useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import User from '../components/User';
import TenantSchedule from '../components/TenantSchedule';
import ManagerSchedule from '../components/ManagerSchedule';
import Calendar from '../components/Calendar';
import dayjs, { Dayjs } from 'dayjs';
import { Role, UserScheduleProps } from '../types';
import { UserContext } from '../contexts/UserContext';
import { arrayToObjectByKey } from '../utils/transforms';

interface UserComponentProps extends UserScheduleProps {
  role: Role;
}

const UserComponent = ({role, ...props}: UserComponentProps) => {
  return role === 'manager'
    ? <ManagerSchedule {...props}/>
    : <TenantSchedule {...props}/>
}

export default function Page() {
  const { users, availability, bookings } = useSelector((state: RootState) => state.app);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const { user } = useContext(UserContext);

  const safeUserId = user?.id ?? null;
  const currentDateString = date.format('DD/MM/YYYY');

  const role = useMemo(() => {
    return users.find(u => u.id === safeUserId)?.role ?? 'tenant';
  }, [users, safeUserId]);

  const userSlots = useMemo(() => {
    return role === 'manager'
      ? availability.filter(s => s.managerId === safeUserId)
      : availability;
  }, [availability, role, safeUserId]);

  const calendarProps = useMemo(() => ({ 
    slots: userSlots, 
    books: bookings 
  }), [userSlots, bookings]);

  const daySlots = useMemo(() => {
    const selectedDay = date.day() === 0 ? 7 : date.day();
    return userSlots
      .filter(slot => slot.daysOfWeek.includes(selectedDay) || slot.selectedDate === currentDateString)
      .sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [date, userSlots, currentDateString]);

  const dayBooks = useMemo(() => {
    return bookings.filter(b => b.bookDate === currentDateString);
  }, [bookings, currentDateString]);

  const booksBySlotId = useMemo(() => {
    return arrayToObjectByKey('slotId', dayBooks);
  }, [dayBooks]);

  const usersById = useMemo(() => {
    return arrayToObjectByKey('id', users);
  }, [users]);

  const componentProps: UserComponentProps = useMemo(() => ({
    role,
    currentDateString,
    dayUserSlots: daySlots,
    allUserSlots: userSlots,
    booksBySlotId,
    usersById
  }), [role, currentDateString, daySlots, userSlots, booksBySlotId, usersById]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 px-8 pb-12" style={{ minWidth: '480px' }}>
      <User />
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row lgx:flex-row">
          <div className="place-items-center border-b lg:border-r h-auto pt-6 px-4">
            <Calendar
              date={date}
              day={calendarProps}
              onChange={setDate}
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-xl font-semibold mr-4">Schedule for {date? date.format('MMMM DD, YYYY') : '...'}</h2>
              <div className="text-sm text-gray-500">Local time: {new Date().toLocaleString()}</div>
            </div>
            {user.id
              ? <UserComponent {...componentProps}/>
              : <div>Select user</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
