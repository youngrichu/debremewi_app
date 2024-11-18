import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: '0' | '1';
  created_at: string;
  type?: string;
  reference_id?: string;
  reference_url?: string;
}

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  unreadCount: 0,
  notifications: [],
  loading: false,
  error: null
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Notification[]>('/wp-json/church-app/v1/notifications/');
      const unreadCount = response.data.filter(n => n.is_read === '0').length;
      return {
        notifications: response.data,
        unreadCount
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No auth token found');
      }

      const response = await apiClient.put(
        `/wp-json/church-app/v1/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.status === 200 ? notificationId : rejectWithValue('Failed to mark as read');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
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
        if (notification?.is_read === '0') {
          notification.is_read = '1';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer; 