import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileService } from '../services/ProfileService';

export interface UserState {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  christianName?: string;
  phoneNumber?: string;
  photo?: string;
  profilePhoto?: string;
  profilePhotoUrl?: string;
  gender?: string;
  maritalStatus?: string;
  educationLevel?: string;
  occupation?: string;
  residencyCity?: string;
  residenceAddress?: string;
  emergencyContact?: string;
  christianLife?: string;
  serviceAtParish?: string;
  ministryService?: string;
  hasFatherConfessor?: string;
  fatherConfessorName?: string;
  hasAssociationMembership?: string;
  associationName?: string;
  residencePermit?: string;
  isOnboardingComplete?: boolean;
}

const initialState: UserState = {
  id: undefined,
  email: undefined,
  firstName: undefined,
  lastName: undefined,
  phoneNumber: undefined,
  gender: undefined,
  christianName: undefined,
  residencyCity: undefined,
  isOnboardingComplete: false,
  photo: undefined,
  profilePhoto: undefined,
  profilePhotoUrl: undefined,
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
