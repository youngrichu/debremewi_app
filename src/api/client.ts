import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';
import { AuthService } from '../services/AuthService';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { clearUser } from '../store/userSlice';

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
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('Authentication error detected, clearing auth data...');
      
      try {
        // Clear auth data from store and storage
        await AuthService.clearAuth();
        store.dispatch(clearAuth());
        store.dispatch(clearUser());
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
      
      return Promise.reject(new Error('Session expired. Please login again.'));
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
