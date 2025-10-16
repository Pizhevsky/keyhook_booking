import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import User from '../components/User';
import TenantSchedule from '../components/TenantSchedule';
import ManagerSchedule from '../components/ManagerSchedule';
import Calendar from '../components/Calendar';
import dayjs, { Dayjs } from 'dayjs';
import { Role, SlotsAndBooks, UserScheduleProps } from '../types';
import { UserContext } from '../contexts/UserContext';

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
  const [calendarProps, setCalendarProps] = useState<SlotsAndBooks>({ slots: [], books: [] });
  const [componentProps, setComponentProps] = useState<UserComponentProps>({
    role: 'tenant',
    currentDateString: date.format("DD/MM/YYYY"),
    slots: [], 
    books: [], 
    users: users
  });
  const { user } = useContext(UserContext);

  useEffect(() => {
      const { role } = users.find(item => item.id === user.id) || { role: 'tenant' };

      const userSlots = role === 'manager' 
        ? availability.filter(item => item.managerId === user.id)
        : availability;
      const userBooks = role === 'tenant'
        ? bookings.filter(item => item.tenantId === user.id)
        : bookings;

      setCalendarProps({
        slots: userSlots,
        books: userBooks
      });

      const selectedDay = date.day(); 
      const currentDateString = date.format("DD/MM/YYYY");

      const daySlots = userSlots.filter(item => 
        item.daysOfWeek.includes(selectedDay) ||
        item.selectedDate === currentDateString
      );
      const dayBooks = userBooks.filter(item => 
        item.bookDate === currentDateString
      );

      setComponentProps({ 
        role,
        currentDateString: date.format("DD/MM/YYYY"),
        slots: daySlots.sort((a,b) => a.startTime.localeCompare(b.startTime)), 
        books: dayBooks,
        users
      });
  }, [date, user, users, availability, bookings]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 px-8 pb-12" style={{ minWidth: '480px' }}>
      <User />
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="place-items-center border-b lg:border-r h-auto pt-6 lg:pt-0">
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
              : <></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
