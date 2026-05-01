import { useEffect, useState } from "react";
import { useAppSelector, type RootState } from "../store";
import { useUser } from "../contexts/UserContext";
import UserCreate from "./UserCreate";

const BadgesDescription = () => {
  const badges = [
    { color: 'bg-green-500', label: '3', text: '– Available booking' },
    { color: 'bg-yellow-400', label: '1', text: '– User bookings' },
    { color: 'bg-red-400',   label: '✕',  text: '– All slots are booked' },
  ];
  return (
    <div className="flex flex-wrap gap-4 justify-left">
      {badges.map(({ color, label, text }) => (
        <div key={text} className="flex flex-row items-center">
          <div className={`flex items-center justify-center w-5 h-5 ${color} rounded-full text-white text-xs mt-1`}>
            {label}
          </div>
          <span>&nbsp;{text}</span>
        </div>
      ))}
      <div>(number shows available slots)</div>
    </div>
  );
}

export default function User () {
  const { users } = useAppSelector((state: RootState) => state.app);
  const [currentUserId, setCurrentUserId] = useState(0);
  const { setUser } = useUser();

  useEffect(() => {
    if (users.length && currentUserId === 0) {
      setUser(users[0]);
      setCurrentUserId(users[0].id);
    }
  }, [users, currentUserId, setUser]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find(item => item.id === Number(e.target.value));
    if (selectedUser) {
      setUser(selectedUser);
      setCurrentUserId(selectedUser.id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
          <div className="flex items-center gap-2 mr-8">
            <span>Current user</span>
            {users.length > 0 && (
              <select className="border rounded p-1" value={currentUserId} onChange={onChange}>
                {users.map(user => 
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                )}
              </select>
            )}
          </div>
          <UserCreate/>
        </div>
        <BadgesDescription />
      </div>
    </div>
  );
}
