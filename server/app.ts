import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import usersRouter from './routes/users';
import availabilityRouter from './routes/availability';
import bookingsRouter from './routes/bookings';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', usersRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/book', bookingsRouter); // POST /api/book, DELETE /api/book/:id

export default app;