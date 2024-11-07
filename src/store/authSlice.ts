import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiClient, { API_ROUTES } from '../api/client';
import { User } from '../types';

export const login = createAsyncThunk('auth/login', async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
  try {
    console.log('Attempting to login with:', { username, password });
    const url = `${apiClient.defaults.baseURL}${API_ROUTES.auth}`;
    console.log('Full Login URL:', url);
    console.log('Requesting login with:', {
      method: 'POST',
      url,
      data: { username, password },
    });
    const response = await apiClient.post<{ token: string; user: User }>(url, {
      username,
      password,
    });
    console.log('Login response:', response.data);
    if (response.data.success) {
      const token = response.data.data.jwt;
      console.log('Extracted token:', token);
      return {
        token,
        user: {
          email: username,
          // Add other user properties if needed
        },
      };
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Login error response:', error.response.data);
      const errorMessage = error.response.data.data?.message || 'Login failed';
      return rejectWithValue(errorMessage);
    } else if (error.message) {
      console.error('Login error:', error.message);
      return rejectWithValue(error.message);
    } else {
      console.error('Login error:', error);
      return rejectWithValue('An unknown error occurred. Please try again.');
    }
  }
});

// ... rest of the code remains unchanged ...
