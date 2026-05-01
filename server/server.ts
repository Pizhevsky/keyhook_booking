import http from 'http';
import app from './app';
import { setupWSServer } from './wsServer';
import { setBroadcast }  from './lib/broadcast';
import { syncModels }    from './models';
import { seedIfEmpty }   from './lib/seed';

const PORT = Number(process.env.PORT ?? 4000);

async function start(): Promise<void> {
  await syncModels();
  await seedIfEmpty();

  const server = http.createServer(app);
  const { broadcast } = setupWSServer(server);
  setBroadcast(broadcast);

  server.listen(PORT, () => {
    console.log(`Server running  http://localhost:${PORT}`);
    console.log(`Server ws ready ws://localhost:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Server ${signal} received — shutting down`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
