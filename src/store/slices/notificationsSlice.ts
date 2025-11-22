import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';
import { RootState } from '../index';

export interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: '0' | '1';
  created_at: string;
  type?: string;
  reference_id?: string;
  reference_url?: string;
  image_url?: string;
  featured_image?: string;
  event_image?: string;
  post_image?: string;
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
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const registrationDate = state.user.registrationDate;

      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await axios.get(`${API_URL}/wp-json/church-app/v1/notifications/`, { headers });

      // Handle both array and object with notifications field
      let notifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];

      // Filter notifications for new users (only show notifications created after their registration)
      if (registrationDate) {
        notifications = notifications.filter((n: Notification) => {
          // Parse dates for comparison
          const notificationDate = new Date(n.created_at);
          const userRegDate = new Date(registrationDate);
          return notificationDate >= userRegDate;
        });
      }

      const unreadCount = notifications.filter((n: Notification) => n.is_read === '0').length;

      return {
        notifications,
        unreadCount
      };
    } catch (error: any) {
      console.error('Notification fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await axios.put(
        `${API_URL}/wp-json/church-app/v1/notifications/${notificationId}/read`,
        {},
        { headers }
      );
      return notificationId;
    } catch (error: any) {
      console.error('Mark as read error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notification as read');
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
      state.error = null;
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
        console.error('Notification fetch rejected:', action.payload);
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && notification.is_read === '0') {
          notification.is_read = '1';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

// Selectors
const selectNotificationsState = (state: RootState) => state.notifications;

export const selectUnreadCount = createSelector(
  [selectNotificationsState],
  (notifications) => notifications?.unreadCount ?? 0
);

export const selectNotificationsLoading = createSelector(
  [selectNotificationsState],
  (notifications) => notifications?.loading ?? false
);

export const selectNotifications = createSelector(
  [selectNotificationsState],
  (notifications) => notifications?.notifications ?? []
);

export const selectNotificationsError = createSelector(
  [selectNotificationsState],
  (notifications) => notifications?.error ?? null
);

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;