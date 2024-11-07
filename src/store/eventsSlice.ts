import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/client';
import { Event } from '../types';

export const getEvents = createAsyncThunk('events/getEvents', async () => {
  const response = await apiClient.get<ApiResponse<Event[]>>('/wp-json/wp/v2/events');
  return response.data.data;
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [] as Event[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load events';
      });
  },
});

export default eventsSlice.reducer;
