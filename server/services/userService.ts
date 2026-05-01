import { User } from '../models';
import { broadcast } from '../lib/broadcast';
import type { UserRole } from '../types';

export async function getAllUsers() {
  return User.findAll({ attributes: ['id', 'name', 'role'] });
}

export async function createUser(name: string, role: UserRole) {
  const user = await User.create({ name: name.trim(), role });
  broadcast({ type: 'USER_CREATED', payload: user.toJSON() });
  return user;
}
