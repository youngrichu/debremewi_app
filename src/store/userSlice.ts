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
  async (_, { rejectWithValue }) => {
    try {
      const profileService = new ProfileService();
      const updatedProfile = await profileService.updateProfile(_);
      return updatedProfile;
    } catch (error) {
      return rejectWithValue('Failed to update profile');
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
      });
  },
});

export const { setUser, clearUser, completeOnboarding } = userSlice.actions;
export default userSlice.reducer;
