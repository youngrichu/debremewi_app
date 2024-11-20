import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: 'https://staging.dubaidebremewi.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Initialize token from AsyncStorage
const initializeToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token initialized in API client:', token);
    } else {
      console.log('No token found in AsyncStorage during initialization');
    }
  } catch (error) {
    console.error('Error initializing token:', error);
  }
};

// Call initialization immediately
initializeToken();

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Function to refresh token
const refreshToken = async () => {
  try {
    const currentToken = await AsyncStorage.getItem('userToken');
    if (!currentToken) throw new Error('No token found');

    const response = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/token/refresh`, {
      token: currentToken,
      AUTH_KEY: 'debremewi'
    });

    if (response.data.success) {
      const newToken = response.data.data?.jwt || response.data.jwt;
      await AsyncStorage.setItem('userToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newToken;
    }
    throw new Error('Token refresh failed');
  } catch (error) {
    await AsyncStorage.removeItem('userToken');
    delete apiClient.defaults.headers.common['Authorization'];
    throw error;
  }
};

// Add request interceptor to add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No token found for request:', config.url);
      }
      console.log('Request Config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
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

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If token refresh is in progress, queue the failed request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    // Mark request for retry and start token refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshToken();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear token and reject with original error
      await AsyncStorage.removeItem('userToken');
      delete apiClient.defaults.headers.common['Authorization'];
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
