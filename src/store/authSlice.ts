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
    console.log('Attempting to register with:', { username, password, AUTH_KEY: 'AUTH_KEY_VALUE' });
    console.log('Full Register URL:', url);
    console.log('Requesting registration with:', {
      method: 'POST',
      url,
      params: { email: username, password, AUTH_KEY: 'AUTH_KEY_VALUE' },
    });
    const response = await apiClient.post<{ token: string; user: User }>(url, null, {
      params: { email: username, password },
    });
    console.log('Login successful:', response.data);
    return {
      token: response.data.data.jwt,
      user: {
        email: username,
        // Add other user properties if needed
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
  try {
    const url = `${apiClient.defaults.baseURL}${API_ROUTES.register}`;
    const response = await apiClient.post<{ token: string; user: User }>(url, null, {
      params: { email: username, password, AUTH_KEY: 'AUTH_KEY_VALUE' },
    });
    return {
      token: response.data.data.jwt,
      user: {
        email: username,
        // Add other user properties if needed
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return rejectWithValue(error.response?.data || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
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
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
