import http from 'http';
import app from './app';
import { setupWSServer } from './wsServer';
import { setBroadcast } from './broadcast';
import { syncModels, User, Availability } from './models';

const server = http.createServer(app);
const { broadcast } = setupWSServer(server);
setBroadcast(broadcast);

(async () => {
  await syncModels();
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      { name: 'Alice Tenant', role: 'tenant' },
      { name: 'Bob Tenant', role: 'tenant' },
      { name: 'Manager Mike', role: 'manager' },
      { name: 'Manager Jane', role: 'manager' }
    ]);
    await Availability.bulkCreate([
      { managerId: 3, daysOfWeek: '1;5', selectedDate: '', startTime: '10:00', endTime: '12:00', timeZone: 'Pacific/Auckland' },
      { managerId: 4, daysOfWeek: '3', selectedDate: '', startTime: '14:00', endTime: '16:00', timeZone: 'Pacific/Auckland' },
      { managerId: 3, daysOfWeek: '5', selectedDate: '', startTime: '13:00', endTime: '14:00', timeZone: 'Pacific/Auckland' }
    ]);
  }
})();

const PORT = process.env.PORT ?? 4000;
server.listen(PORT, () => console.log(`Server+WS running http://localhost:${PORT}`));