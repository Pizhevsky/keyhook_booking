import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState, User, Availability, Booking } from '../types';

const initialState: AppState = { 
  users: [],
  availability: [], 
  bookings: [],
  loading: false,
};

const slice = createSlice({ 
  name: 'app', 
  initialState, 
  reducers: {
    //Loading
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    // Users
    setUsers(state, action: PayloadAction<User[]>) { 
      state.users = action.payload; 
    },
    addUser(state, action: PayloadAction<User>) { 
      if (!state.users.some(item => item.id === action.payload.id)) {
        state.users.push(action.payload);
      }
    },

    //Availability
    setAvailability(state, action: PayloadAction<Availability[]>) { 
      state.availability = action.payload; 
    },
    addAvailability(state, action: PayloadAction<Availability>) {
      if (!state.availability.some(item => item.id === action.payload.id)) {
        state.availability.push(action.payload);
      }
    },
    updateAvailability(state, action: PayloadAction<Availability>) { 
      const idx = state.availability.findIndex(item => item.id === action.payload.id);
      if (idx !== -1) state.availability[idx] = action.payload;
    },
    removeAvailability(state, action: PayloadAction<number>) { 
      state.availability = state.availability.filter(item => item.id !== action.payload); 
    },

    // Bookings
    setBookings(state, action: PayloadAction<Booking[]>) { 
      state.bookings = action.payload; 
    },
    addBooking(state, action: PayloadAction<Booking>) { 
      if (!state.bookings.some(item => item.id === action.payload.id)) {
        state.bookings.push(action.payload);
      }
    },
    updateBooking(state, action: PayloadAction<Booking>) {
      const idx = state.bookings.findIndex(item => item.id === action.payload.id);
      if (idx !== -1) state.bookings[idx] = action.payload;
    },
  }
});

export const { 
  setLoading,
  setUsers, 
  addUser,  
  setAvailability, 
  addAvailability,
  updateAvailability,
  removeAvailability, 
  setBookings, 
  addBooking,
  updateBooking,
} = slice.actions;

export const store = configureStore({ reducer: { app: slice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (s: RootState) => T) => useSelector<RootState, T>(selector);