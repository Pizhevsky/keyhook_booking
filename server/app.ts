import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users';
import availabilityRouter from './routes/availability';
import bookingsRouter from './routes/bookings';
import { errorHandler } from './middleware/errorHandler';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:1234')
  .split(',')
  .map(o => o.trim());

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.use('/api/users', usersRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/book', bookingsRouter);

app.use(errorHandler);

export default app;