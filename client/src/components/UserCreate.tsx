import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { addUser } from "../store";
import { createUser } from "../api";
import toast from "react-hot-toast";
import { Role } from "../types";


export default function UserCreate() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('tenant');

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
    <div className="flex flex-wrap gap-4 items-center">
      <span>Create user</span>
      <input className="border p-1 rounded" 
        placeholder="Name" 
        value={name} 
        onChange={(e)=>setName(e.target.value)}
      />
      <select className="border p-1 rounded" value={role} onChange={(e)=>setRole(e.target.value as Role)}>
        <option value="tenant">Tenant</option>
        <option value="manager">Manager</option>
      </select>
      <button className="px-4 py-1 bg-indigo-600 text-white rounded" onClick={handleCreate}>
        Create
      </button>
    </div>
  );
}
