import React, { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { getUsers, getAvailability, getBookings } from './api';
import { setUsers, setAvailability, setBookings, setCurrentUser } from './store';
import { useSocketDispatch } from './hooks';
import Page from './layouts/Page';
import Header from './components/Header';
import { parseDaysOfWeek } from './utils/time';

export default function App(){
  const dispatch = useDispatch();

  useSocketDispatch();

  useEffect(() => { 
    getUsers()
      .then(users => {
        dispatch(setUsers(users))
        dispatch(setCurrentUser(users[0].id))
      })
      .catch(() => toast.error('Failed users')); 
    getAvailability()
      .then(availability => dispatch(setAvailability(
        availability.map((item: any) => ({
          ...item,
          daysOfWeek: parseDaysOfWeek(item.daysOfWeek)
        }))
      )))
      .catch(() => toast.error('Failed availability')); 
    getBookings()
      .then(bookings => dispatch(setBookings(bookings)))
      .catch(() => toast.error('Failed bookings')); 
  },[]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Toaster />
      <Header />
      <Page />
    </LocalizationProvider>
  );
}
