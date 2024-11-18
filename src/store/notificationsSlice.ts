import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../api/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: string;
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

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/wp-json/church-app/v1/notifications/');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.is_read === '0') {
        notification.is_read = '1';
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
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
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => n.is_read === '0').length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setUnreadCount, 
  setNotifications, 
  setLoading, 
  setError,
  markAsRead 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;