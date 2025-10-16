import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, User, Availability, Booking } from '../types';

const initialState: AppState = { 
  users: [],
  availability: [], 
  bookings: [] 
};

const slice = createSlice({ 
  name: 'app', 
  initialState, 
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) { 
      state.users = action.payload; 
    },
    addUser(state, action: PayloadAction<User>) { 
      state.users = [
        ...state.users,
        action.payload
      ]; 
    },
    setAvailability(state, action: PayloadAction<Availability[]>) { 
      state.availability = action.payload; 
    },
    addAvailability(state, action: PayloadAction<Availability>) {
      state.availability = [
        ...state.availability, 
        action.payload
      ];
    },
    updateAvailability(state, action: PayloadAction<Availability>) { 
      state.availability = state.availability.map(item => 
        item.id === action.payload.id
          ? action.payload
          : item
      ); 
    },
    removeAvailability(state, action: PayloadAction<number>) { 
      state.availability = state.availability.filter(item => item.id !== action.payload); 
    },
    setBookings(state, action: PayloadAction<Booking[]>) { 
      state.bookings = action.payload; 
    },
    addBooking(state, action: PayloadAction<Booking>) { 
      state.bookings = [
        ...state.bookings,
        action.payload
      ];
    },
    removeBooking(state, action: PayloadAction<number>) { 
      state.bookings = state.bookings.filter(item => item.id !== action.payload);
    }
  }
});

export const { 
  setUsers, 
  addUser,  
  setAvailability, 
  addAvailability,
  updateAvailability,
  removeAvailability, 
  setBookings, 
  addBooking, 
  removeBooking 
} = slice.actions;

export const store = configureStore({ reducer: { app: slice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
