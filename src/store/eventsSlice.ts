import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Event } from '../types';
import { getUpcomingEvents } from '../services/EventsService';

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      return await getUpcomingEvents();
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch events');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle app reset
      .addMatcher(
        action => action.type === 'RESET_APP_STATE',
        () => initialState
      );
  },
});

export const { clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
