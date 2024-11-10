import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'https://staging.dubaidebremewi.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to add token to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Ensure we're using the latest token from storage
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log the complete request for debugging
      console.log('Complete request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    return config;
  } catch (error) {
    console.error('Error setting auth header:', error);
    return config;
  }
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for debugging and error handling
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        requestHeaders: error.config?.headers
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
