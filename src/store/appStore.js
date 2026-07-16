import { configureStore } from '@reduxjs/toolkit';
import landsReducer from './landsSlice';
import authReducer from './authSlice';

// Initialize the store
export const appStore = configureStore({
  reducer: {
    lands: landsReducer,
    auth: authReducer,
  },
});
