import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAvailability, updateAvailability, removeAvailability, addBooking, removeBooking, addUser } from './store';
import { parseDaysOfWeek } from './utils/time';

export function useSocketDispatch (url = 'ws://localhost:4000') {
  const dispatch = useDispatch();

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => console.log('ws open'));
    ws.addEventListener('close', () => console.log('ws close'));
    ws.addEventListener('message',(ev) => {
      try {
        const data = JSON.parse(ev.data);

        if (data.type === 'USER_CREATED') {
          dispatch(addUser(data.payload));
        }

        if (data.type === 'AVAILABILITY_CREATED') {
          dispatch(addAvailability({
            ...data.payload,
            daysOfWeek: data.payload.daysOfWeek 
              ? parseDaysOfWeek(data.payload.daysOfWeek)
              : []
          }));
        }

        if (data.type === 'AVAILABILITY_UPDATED') {
          dispatch(updateAvailability({
            ...data.payload,
            daysOfWeek: data.payload.daysOfWeek 
              ? parseDaysOfWeek(data.payload.daysOfWeek)
              : []
          }));
        }

        if (data.type === 'AVAILABILITY_DELETED') {
          dispatch(removeAvailability(data.payload.id));
        }

        if (data.type === 'BOOKING_CREATED') {
          dispatch(addBooking(data.payload));
        }

        if (data.type === 'BOOKING_DELETED') {
          dispatch(removeBooking(data.payload.id));
        }
      } catch(e) {
        console.error(e);
      }
    });

    return () => { 
      ws.close(); 
    };
  }, [url, dispatch]);

  return {};
}
