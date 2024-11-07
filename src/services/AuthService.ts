import apiClient from '../api/client';
import { User } from '../types';

export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  console.log('Login service called with:', { username, password });
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth', { username, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || 'Login failed');
    throw new Error(error.response?.data || 'Login failed');
  }
};

export const register = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth/register', { username, password });
  return response.data;
};

export const logout = async () => {
  await apiClient.post('/simple-jwt-login/v1/auth/revoke');
};
import apiClient from '../api/client';
import { User } from '../types';

export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth', { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Login failed');
  }
};

export const register = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth/register', { username, password });
  return response.data;
};

export const logout = async () => {
  await apiClient.post('/simple-jwt-login/v1/auth/revoke');
};
