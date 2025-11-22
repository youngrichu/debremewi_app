import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, ChildInfo } from '../../types/index';

interface UserState {
  userData: UserProfile | null;
  children: ChildInfo[];
  loading: boolean;
  error: string | null;
  registrationDate: string | null;
}

const initialState: UserState = {
  userData: null,
  children: [],
  loading: false,
  error: null,
  registrationDate: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserProfile>) => {
      state.userData = action.payload;
      state.children = action.payload.children || [];
    },
    updateChildren: (state, action: PayloadAction<ChildInfo[]>) => {
      state.children = action.payload;
      if (state.userData) {
        state.userData.children = action.payload;
      }
    },
    setRegistrationDate: (state, action: PayloadAction<string>) => {
      state.registrationDate = action.payload;
    },
    clearUser: (state) => {
      state.userData = null;
      state.children = [];
      state.error = null;
      state.registrationDate = null;
    },
  },
});

export const { setUserData, updateChildren, setRegistrationDate, clearUser } = userSlice.actions;
export default userSlice.reducer; 
