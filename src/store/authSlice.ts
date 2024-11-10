import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

interface LoginResponse {
  data: {
    jwt: string;
    email?: string;
    id?: string;
    username?: string;
  };
  success: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  token: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/wp-json/simple-jwt-login/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();
      console.log('Login Response:', data);

      if (!data.success || !data.data.jwt) {
        return rejectWithValue('Login failed');
      }

      // Store the token
      await AsyncStorage.setItem('userToken', data.data.jwt);
      
      // Create user object from response
      const user = {
        id: data.data.id,
        email: data.data.email,
        username: data.data.username,
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return {
        token: data.data.jwt,
        user,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userStr = await AsyncStorage.getItem('user');

      if (!token || !userStr) {
        return rejectWithValue('No auth token found');
      }

      const user = JSON.parse(userStr);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
