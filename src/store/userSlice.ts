import { createSlice } from '@reduxjs/toolkit';
import { User } from '../types';

const initialState: User | null = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return action.payload;
    },
    clearUser: () => {
      return null;
    },
    loginAttempt: (state, action) => {
      if (action.payload.success) {
        return action.payload.user;
      }
      return state; // Keep the current state if login failed
    },
  },
});

export const { setUser, clearUser, loginAttempt } = userSlice.actions;
export default userSlice.reducer;
