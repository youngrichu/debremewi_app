import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types';

interface UserState {
  userData: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userData: null,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserProfile>) => {
      state.userData = action.payload;
      state.error = null;
    },
    clearUserData: (state) => {
      state.userData = null;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  }
});

export const { setUserData, clearUserData, setError } = userSlice.actions;
export default userSlice.reducer; 
