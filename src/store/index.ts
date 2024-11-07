import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import eventsReducer from './eventsSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    events: eventsReducer,
    notifications: notificationReducer,
  },
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
