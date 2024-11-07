import apiClient from '../api/client';
import { User } from '../types';

export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth', { username, password });
  return response.data;
};

export const register = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post<{ token: string; user: User }>('/simple-jwt-login/v1/auth/register', { username, password });
  return response.data;
};

export const logout = async () => {
  await apiClient.post('/simple-jwt-login/v1/auth/revoke');
};
