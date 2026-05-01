import { User, Availability } from '../models';

export async function seedIfEmpty(): Promise<void> {
  const count = await User.count();
  if (count > 0) return;

  const [, , mike, jane] = await User.bulkCreate([
    { name: 'Alice Tenant',  role: 'tenant'  },
    { name: 'Bob Tenant',    role: 'tenant'  },
    { name: 'Manager Mike',  role: 'manager' },
    { name: 'Manager Jane',  role: 'manager' },
  ]);

  await Availability.bulkCreate([
    { managerId: mike.id, daysOfWeek: '1;5', selectedDate: '', startTime: '10:00', endTime: '12:00', timezone: 'Pacific/Auckland' },
    { managerId: jane.id, daysOfWeek: '3',   selectedDate: '', startTime: '14:00', endTime: '16:00', timezone: 'Pacific/Auckland' },
    { managerId: mike.id, daysOfWeek: '5',   selectedDate: '', startTime: '13:00', endTime: '14:00', timezone: 'Pacific/Auckland' },
  ]);
}
