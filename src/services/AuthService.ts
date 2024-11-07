import apiClient from '../api/client';
import { User } from '../types';

export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  console.log('Login service called with:', { username, password });
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth', { username, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    if (apiClient.isAxiosError(error)) {
      console.error('Login error:', error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
    } else {
      console.error('Login error:', error);
    }
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth/register', { username, password });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    if (apiClient.isAxiosError(error)) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    } else {
      console.error('Registration error:', error);
    }
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/simple-jwt-login/v1/auth/revoke');
    console.log('Logout successful');
  } catch (error) {
    if (apiClient.isAxiosError(error)) {
      console.error('Logout error:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    } else {
      console.error('Logout error:', error);
    }
  }
};
