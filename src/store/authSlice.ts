import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setUser } from './userSlice';
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { dispatch }) => {
    try {
      // Login request using simple-jwt-login endpoint
      const loginResponse = await apiClient.post('/wp-json/simple-jwt-login/v1/auth', {
        email: credentials.username,
        password: credentials.password,
        AUTH_KEY: 'debremewi'
      });

      console.log('Login response:', loginResponse.data);

      if (!loginResponse.data.success) {
        throw new Error(loginResponse.data.message || 'Login failed');
      }

      const token = loginResponse.data.data.jwt;

      // Store token in AsyncStorage first
      await AsyncStorage.setItem('userToken', token);

      // Update the API client headers with the new token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Get user profile data from our custom endpoint
        const profileResponse = await apiClient.get('/wp-json/church-mobile/v1/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.data.success) {
          throw new Error('Failed to get profile');
        }

        const userProfile = profileResponse.data.user;

        // Check if profile is complete by verifying required fields
        const isProfileComplete = Boolean(
          userProfile.firstName &&
          userProfile.lastName &&
          userProfile.phoneNumber &&
          userProfile.residencyCity
        );

        // Update user state with the complete profile and onboarding status
        dispatch(setUser({
          ...userProfile,
          isOnboardingComplete: isProfileComplete // Set based on profile completeness
        }));
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        // Even if profile fetch fails, we still want to log in the user with basic info
        const basicUserProfile = {
          id: parseInt(loginResponse.data.data.id),
          username: credentials.username,
          email: credentials.username,
          firstName: '',
          lastName: '',
          phoneNumber: '',
          gender: 'prefer_not_to_say' as const,
          christianName: '',
          residencyCity: '',
          isOnboardingComplete: false,
        };
        dispatch(setUser(basicUserProfile));
      }

      return token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
