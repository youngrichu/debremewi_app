import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Clear all auth-related storage
      await AsyncStorage.multiRemove([
        'userToken',
        'userData',
        'pushToken',
        'language'
      ]);

      // Clear API client headers
      delete apiClient.defaults.headers.common['Authorization'];

      // Reset the app state
      dispatch({ type: 'RESET_APP_STATE' });

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout properly. Please try again.');
      return false;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // Keep the error state to show any logout failures
      })
      // Handle the reset app state action
      .addMatcher(
        action => action.type === 'RESET_APP_STATE',
        () => initialState
      );
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
