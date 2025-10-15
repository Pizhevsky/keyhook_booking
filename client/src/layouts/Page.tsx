import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import User from '../components/User';
import TenantSchedule from '../components/TenantSchedule';
import ManagerSchedule from '../components/ManagerSchedule';
import Calendar from '../components/Calendar';
import dayjs, { Dayjs } from 'dayjs';

const componentsByRole = {
  manager: ManagerSchedule,
  tenant: TenantSchedule
}

export default function Page() {
  const { users, currentUserId, availability, bookings } = useSelector((state: RootState) => state.app);
  const currentUser = users.find(user => user.id === currentUserId);
  const [date, setDate] = useState<Dayjs>(dayjs());

  const userAvailability = currentUser?.role === 'manager'
    ? availability.filter(item => item.managerId === currentUserId)
    : availability;

  const userBookings = currentUser?.role === 'tenant'
    ? bookings.filter(item => item.tenantId === currentUserId)
    : bookings;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 px-8 pb-12" style={{ minWidth: '480px' }}>
      <User />
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="place-items-center border-b lg:border-r h-auto pt-6 lg:px-6">
            <Calendar
              date={date}
              availability={userAvailability}
              bookings={userBookings}
              onChange={setDate}
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-xl font-semibold mr-4">Schedule for {date? date.format('MMMM DD, YYYY') : '...'}</h2>
              <div className="text-sm text-gray-500">Local time: {new Date().toLocaleString()}</div>
            </div>
            {currentUser
              ? React.createElement(componentsByRole[currentUser.role], { date, currentUser })
              : <></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
