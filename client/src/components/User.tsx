import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addUser, RootState, setCurrentUser } from "../store";
import { createUser } from "../api";
import toast from "react-hot-toast";
import { Role } from "../types";


export default function User() {
  const dispatch = useDispatch();
  const { users, currentUserId } = useSelector((state: RootState) => state.app);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('tenant');

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrentUser(Number(e.target.value)));
  }

  const handleCreate = async () => {
    if (!name) return toast.error('Enter name');

    await createUser(name, role).then(user => {
      dispatch(addUser(user)); 
      setName(''); 
      toast.success('User created'); 
    }).catch(e => { 
      toast.error('Failed'); 
    });
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="p-6">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2 mr-8">
              <span>Current user:</span>
              {users.length && currentUserId
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
            <div className="flex flex-row gap-4">
              <span>🟢 - Available booking</span>
              <span>🟡 - User bookings </span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6" style={{ display: "none" }}>
          <div className="mt-6 p-4 border rounded">
            <h3 className="font-medium mb-2">Create user</h3>
            <div className="flex gap-2 items-center">
              <input className="border p-2 rounded flex-1" 
                placeholder="Name" 
                value={name} 
                onChange={(e)=>setName(e.target.value)}
              />
              <select className="border p-2 rounded" value={role} onChange={(e)=>setRole(e.target.value as any)} >
                <option value="tenant">Tenant</option>
                <option value="manager">Manager</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={handleCreate} >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
