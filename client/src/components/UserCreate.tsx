import { useState } from "react";
import { createUser } from "../services/apiService";
import { handleApiAction, showErrorToast } from '../services/errorService';
import { addUser, useAppDispatch } from '../store';
import type { Role } from "../types";

export default function UserCreate() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('tenant');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return showErrorToast('Enter name');

    setBusy(true);

    const result = await handleApiAction(
      () => createUser(name, role),
      {
        successMessage: 'User created',
        errorMessage: 'Failed to create user',
        logLabel: 'Create user failed',
      },
    );

    setBusy(false);

    if (result.ok) {
      dispatch(addUser(result.data));
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <span>Create user</span>
      <input className="border p-1 rounded" 
        placeholder="Name" 
        value={name} 
        disabled={busy}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleCreate()}
      />
      <select className="border p-1 rounded" 
        value={role} 
        onChange={e => setRole(e.target.value as Role)}
      >
        <option value="tenant">Tenant</option>
        <option value="manager">Manager</option>
      </select>
      <button type="button" className="px-4 py-1 bg-indigo-600 text-white rounded"
        disabled={busy}
        onClick={handleCreate}
      >
        {busy ? 'Creating…' : 'Create'}
      </button>
    </div>
  );
}
