import React, { useContext, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "../store";
import { UserContext } from "../contexts/UserContext";
import UserCreate from "./UserCreate";

export default function User () {
  const { users } = useSelector((state: RootState) => state.app);
  const [currentUserId, setCurrentUserId] = useState(0);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    if (users.length) {
      setUser(users[0]);
      setCurrentUserId(users[0].id);
    }
  }, [users]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currentUser = users.find(item => item.id === Number(e.target.value));
    if (currentUser) {
      setUser(currentUser);
      setCurrentUserId(currentUser.id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
          <div className="flex items-center gap-2 mr-8">
            <span>Current user</span>
            {users.length
              ? <select className="border rounded p-1" value={currentUserId} onChange={onChange}>
                  {users.map(user => 
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  )}
                </select>
              : <></>
            }
          </div>
          <UserCreate/>
        </div>
        <div className="flex flex-wrap gap-4 justify-left">
          <div className="flex flex-row items-center">
            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full text-white text-xs mt-1">
              3
            </div><span>&nbsp;- Available booking</span>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex items-center justify-center w-5 h-5 bg-yellow-400 rounded-full text-white text-xs mt-1">
              1
            </div><span>&nbsp;- User bookings </span>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex items-center justify-center w-5 h-5 bg-red-400 rounded-full text-white text-xs mt-1">
              <span>&#10005;</span>
            </div><span>&nbsp;- All slots are booked </span>
          </div>
          <div>(number shows available slots)</div>
        </div>
      </div>
    </div>
  );
}
