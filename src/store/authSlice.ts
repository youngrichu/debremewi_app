import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/client';
import { User } from '../types';

export const login = createAsyncThunk('auth/login', async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
  try {
    console.log('Attempting to login with:', { username, password });
    const response = await apiClient.post<{ token: string; user: User }>(API_ROUTES.auth, { username, password });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, password }: { username: string; password: string }) => {
  const response = await apiClient.post<{ token: string; user: User }>(API_ROUTES.register, { username, password });
  return response.data;
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
