import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileService } from '../services/ProfileService';

interface UserState {
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  gender: string | null;
  christianName: string | null;
  residencyCity: string | null;
  isOnboardingComplete: boolean;
  photo: string | null;
  profilePhoto: string | null;
  profilePhotoUrl: string | null;
}

const initialState: UserState = {
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  phoneNumber: null,
  gender: null,
  christianName: null,
  residencyCity: null,
  isOnboardingComplete: false,
  photo: null,
  profilePhoto: null,
  profilePhotoUrl: null,
};

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserState>, { rejectWithValue }) => {
    try {
      const updatedUser = await ProfileService.updateProfile(profileData);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    clearUser() {
      return initialState;
    },
    completeOnboarding(state) {
      state.isOnboardingComplete = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        // Handle error state if needed
        console.error('Profile update failed:', action.payload);
      });
  },
});

export const { setUser, clearUser, completeOnboarding } = userSlice.actions;
export default userSlice.reducer;
