import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Notification } from '../types';
import { NotificationService } from '../services/NotificationService';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await NotificationService.getNotifications();
      const unreadCount = notifications.filter(n => n.is_read === '0').length;
      return { notifications, unreadCount };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      if (!success) {
        throw new Error('Failed to mark notification as read');
      }
      return notificationId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && notification.is_read === '0') {
          notification.is_read = '1';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationsSlice.reducer; 