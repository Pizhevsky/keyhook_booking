import { useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { 
  addAvailability, 
  updateAvailability, 
  removeAvailability, 
  addBooking, 
  updateBooking, 
  addUser, 
  useAppDispatch
} from '../store';
import { parseDaysOfWeek } from '../utils/time';
import type { ServerAvailability, WsEvent } from '../types';

const SERVER_TYPE = process.env.SERVER_TYPE
const WS_URL = process.env.WS_URL ?? 'ws://localhost:4000';
const SIGNALR_URL = process.env.API_URL ?? 'http://localhost:4000';

interface SocketParams {
  url: string
  onEvent: (data: WsEvent) => void
}

// Shared event dispatcher
function parseAvailability(payload: ServerAvailability) {
  return { ...payload, daysOfWeek: parseDaysOfWeek(payload.daysOfWeek) };
}

const initNodeWs = ({url, onEvent}: SocketParams): () => void => {
  const ws = new WebSocket(url);

  ws.addEventListener('open', () => console.log('WS open'));
  ws.addEventListener('close', () => console.log('WS close'));
  ws.addEventListener('error', (e) => console.error('WS error', e));
  ws.addEventListener('message',(message) => {
    try {
      onEvent(JSON.parse(message.data) as WsEvent);
    } catch (err) {
      console.error('WS error', err);
    }
  }); 

  return () => ws.close(); 
}

const initSignalR = ({url, onEvent}: SocketParams): () => void => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${url}/bookingHub`)
    .withAutomaticReconnect()
    .build();

  connection.on('message', (data: WsEvent) => {
    try {
      onEvent(data);
    } catch (err) {
      console.error(err);
    }
  });

  connection.start()
    .then(() => console.log('SignalR connected'))
    .catch(err => console.error('SignalR connection error:', err));

  return () => {
    connection.stop();
  };
}

export function useSocketDispatch (): void {
  const dispatch = useAppDispatch();
  
  const handleEvent = useCallback((data: WsEvent) => {
    switch (data.type) {
      case 'USER_CREATED':
        dispatch(addUser(data.payload));
        break;
      case 'AVAILABILITY_CREATED':
        dispatch(addAvailability(parseAvailability(data.payload)));
        break;
      case 'AVAILABILITY_UPDATED':
        dispatch(updateAvailability(parseAvailability(data.payload)));
        break;
      case 'AVAILABILITY_DELETED':
        dispatch(removeAvailability(data.payload.id));
        break;
      case 'BOOKING_CREATED':
        dispatch(addBooking(data.payload));
        break;
      case 'BOOKING_CANCELLED':
        dispatch(updateBooking(data.payload));
        break;
    }
  }, [dispatch]);

  useEffect(() => {
    const cleanup = SERVER_TYPE === 'dotnet'
      ? initSignalR({ url: SIGNALR_URL, onEvent: handleEvent })
      : initNodeWs({ url: WS_URL, onEvent: handleEvent });

    return cleanup;
  }, [handleEvent]);
}