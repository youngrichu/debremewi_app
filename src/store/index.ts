import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from './notificationsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
