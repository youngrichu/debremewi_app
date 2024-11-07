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
    console.log('Login successful:', response.data);
    return {
      token: response.data.token, // Adjust this line based on the actual response structure
      user: {
        email: username,
        // Add other user properties if needed
      },
    };
  } catch (error) {
    if (error.response) {
      console.error('Login error response:', error.response.data);
      return rejectWithValue(error.response.data.message || 'Login failed');
    } else {
      console.error('Login error:', error.message);
      return rejectWithValue('Network error. Please try again.');
    }
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
  try {
    const url = `${apiClient.defaults.baseURL}${API_ROUTES.register}`;
    console.log('Attempting to register with:', { email: username, password, AUTH_KEY: 'debremewi' });
    console.log('Full Register URL:', url);
    console.log('Requesting registration with:', {
      method: 'POST',
      url,
      data: { email: username, password, AUTH_KEY: 'debremewi' },
    });
    try {
      const response = await apiClient.post<{ token: string; user: User }>(url, {
        AUTH_KEY: 'debremewi',
        email: username,
        password,
      });
      console.log('Registration successful:', response.data);
      // Dispatch login action after successful registration
      const loginResponse = await apiClient.post<{ token: string; user: User }>(`${apiClient.defaults.baseURL}${API_ROUTES.auth}`, {
        username,
        password,
      });
      console.log('Auto-login successful:', loginResponse.data);
      return {
        token: loginResponse.data.token,
        user: {
          email: username,
          // Add other user properties if needed
        },
      };
    } catch (error) {
      if (error.response) {
        console.error('Registration error response:', error.response.data);
        if (error.response.data.data.errorCode === 38) {
          return rejectWithValue('User already exists. Please try logging in.');
        }
      } else {
        console.error('Registration error:', error.message);
      }
      if (error.response) {
        console.error('Registration error response:', error.response.data);
        return rejectWithValue(error.response.data.message || 'Registration failed');
      } else {
        console.error('Registration error:', error.message);
        return rejectWithValue('Network error. Please try again.');
      }
    }
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
