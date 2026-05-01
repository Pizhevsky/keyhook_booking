import { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import { UserProvider } from './contexts/UserContext';
import { useSocketDispatch } from './hooks/useSocketDispatch';
import Page from './layouts/Page';
import { getUsers, getAvailability, getBookings } from './services/apiService';
import { handleApiAction } from './services/errorService';
import { setAvailability, setBookings, setLoading, setUsers, useAppDispatch } from './store';
import { mapServerAvailability } from './utils/transforms';

export default function App() {
  const dispatch = useAppDispatch();

  useSocketDispatch();

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialData(): Promise<void> {
      dispatch(setLoading(true));

      const result = await handleApiAction(
        () => Promise.all([
          getUsers({ signal: controller.signal }),
          getAvailability({ signal: controller.signal }),
          getBookings({ signal: controller.signal })
        ]),
        {
          errorMessage: 'Failed to load data',
          logLabel: 'Initial data load failed',
        }
      );

      if (controller.signal.aborted) {
        return;
      }

      if (result.ok) {
        const [users, availability, bookings] = result.data;

        dispatch(setUsers(users));
        dispatch(setAvailability(availability.map(mapServerAvailability)));
        dispatch(setBookings(bookings));
      }

      dispatch(setLoading(false));
    }

    void loadInitialData();

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  return (
    <UserProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Toaster />
        <Header />
        <Page />
      </LocalizationProvider>
    </UserProvider>
  );
}
