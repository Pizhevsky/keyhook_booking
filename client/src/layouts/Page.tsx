import { useMemo, useState } from 'react';
import { useAppSelector } from '../store';
import type { RootState } from '../store';
import dayjs from '../lib/dayjs';
import type { Dayjs } from '../lib/dayjs';
import type { ManagerScheduleProps, Role } from '../types';
import { useUser } from '../contexts/UserContext';
import { arrayToObjectByKey } from '../utils/transforms';
import User from '../components/User';
import TenantSchedule from '../components/TenantSchedule';
import ManagerSchedule from '../components/ManagerSchedule';
import Calendar from '../components/Calendar';
import { DATE_FORMAT } from '../utils/time';

const UserComponent = ({role, ...props}: {role: Role} & ManagerScheduleProps) => {
  return role === 'manager'
    ? <ManagerSchedule {...props}/>
    : <TenantSchedule {...props}/>
}

export default function Page() {
  const { users, availability, bookings, loading } = useAppSelector((state: RootState) => state.app);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const { user } = useUser();

  const currentDateString = date.format(DATE_FORMAT);

  const role: Role = user?.role ?? 'tenant';

  const userSlots = useMemo(() => {
    return role === 'manager'
      ? availability.filter(s => s.managerId === user?.id)
      : availability;
  }, [availability, role, user?.id]);

  const daySlots = useMemo(() => {
    const selectedDay = date.day() === 0 ? 7 : date.day();
    return userSlots
      .filter(slot => slot.daysOfWeek.includes(selectedDay) || slot.selectedDate === currentDateString)
      .sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [date, userSlots, currentDateString]);

  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'active');
  }, [bookings]);

  const calendarProps = useMemo(() => ({ 
    slots: userSlots, 
    books: activeBookings 
  }), [userSlots, activeBookings]);

  const dayBooks = useMemo(() => {
    return activeBookings.filter(b => b.bookDate === currentDateString);
  }, [activeBookings, currentDateString]);

  const booksBySlotId = useMemo(() => {
    return arrayToObjectByKey('slotId', dayBooks);
  }, [dayBooks]);

  const usersById = useMemo(() => {
    return arrayToObjectByKey('id', users);
  }, [users]);

  const scheduleProps: ManagerScheduleProps = {
    currentDateString,
    dayUserSlots: daySlots,
    allUserSlots: userSlots,
    booksBySlotId,
    usersById
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 px-8 pb-12" style={{ minWidth: '480px' }}>
      <User />
      {loading && (
        <div className="text-center mt-6 text-gray-400">Loading…</div>
      )}
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
              <h2 className="text-xl font-semibold mr-4">Schedule for {date ? date.format('MMMM DD, YYYY') : '...'}</h2>
              <div className="text-sm text-gray-500">Local time: {new Date().toLocaleString()}</div>
            </div>
            {user?.id
              ? <UserComponent role={role} {...scheduleProps}/>
              : <div>Select user</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
