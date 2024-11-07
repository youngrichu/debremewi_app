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
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
