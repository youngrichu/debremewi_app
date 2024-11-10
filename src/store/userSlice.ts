import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserProfile } from '../types';
import { ProfileService } from '../services/ProfileService';

interface UserState extends User {
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: UserState = {
  id: undefined,
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  gender: 'prefer_not_to_say',
  christianName: '',
  residencyCity: '',
  isOnboardingComplete: false,
  loading: false,
  error: null,
  updateSuccess: false
};

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const updatedProfile = await ProfileService.updateProfile(profileData);
      return updatedProfile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await ProfileService.getProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        Object.assign(state, action.payload);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const { setUser, clearUser, resetUpdateSuccess } = userSlice.actions;
export default userSlice.reducer;
