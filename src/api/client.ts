import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { AuthService } from '../services/AuthService';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { clearUser } from '../store/slices/userSlice';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AuthService.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request details for debugging
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.log('Authentication error detected, attempting token refresh...');

      // Don't retry if this is a refresh token request
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('Refresh token request failed, clearing auth data...');
        await AuthService.clearAuth();
        store.dispatch(clearAuth());
        store.dispatch(clearUser());
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      originalRequest._retry = true;

      try {
        const currentToken = await AuthService.getToken();
        if (!currentToken) {
          throw new Error('No token available');
        }

        // Try to refresh the token using efficient refresh
        const { efficientTokenRefresh } = await import('../services/efficientTokenRefresh');
        const newToken = await efficientTokenRefresh.refreshOnDemand();

        if (newToken) {
          // Update the token in storage and retry the original request
          await AsyncStorage.setItem('userToken', newToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          console.log('Token refreshed successfully, retrying original request...');
          return apiClient(originalRequest);
        } else {
          // Refresh failed, clear auth and redirect to login
          console.log('Token refresh failed, clearing auth data...');
          await AuthService.clearAuth();
          store.dispatch(clearAuth());
          store.dispatch(clearUser());
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        await AuthService.clearAuth();
        store.dispatch(clearAuth());
        store.dispatch(clearUser());
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    // Network errors
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Other errors
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export const initializeApiClient = async () => {
  try {
    const token = await AuthService.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token initialized in API client');
    } else {
      console.log('No token found during initialization');
    }
  } catch (error) {
    console.error('Error initializing API client:', error);
  }
};

export default apiClient;
