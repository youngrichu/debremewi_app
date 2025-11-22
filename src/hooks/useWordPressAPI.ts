import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://dubaidebremewi.com';

export const useWordPressAPI = () => {
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/?rest_route=/simple-jwt-login/v1/auth`, {
        email: username,
        password,
        AUTH_KEY: 'debremewi'
      });

      console.log('Login Response:', response.data);

      if (response.data.success) {
        try {
          await AsyncStorage.setItem('userToken', response.data.data?.jwt || response.data.jwt);
          return { success: true, message: 'Login successful' };
        } catch (storageError) {
          console.error('AsyncStorage Error:', storageError);
          return { success: false, message: 'Failed to store authentication token' };
        }
      }

      return {
        success: false,
        message: response.data.data?.message || response.data.message || 'Login failed'
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login Error:', error.message);
        if (error.response) {
          console.error('Server Response:', error.response.data);
          console.error('Status Code:', error.response.status);
          console.error('Headers:', error.response.headers);

          console.log('Complete request details:', {
            url: error.config?.url,
            method: error.config?.method,
            data: typeof error.config?.data === 'string'
              ? JSON.parse(error.config.data)
              : error.config?.data,
            headers: error.config?.headers
          });

          if (error.response.data?.data?.errorCode === 48) {
            return {
              success: false,
              message: 'Invalid email or password. Please try again.'
            };
          }
        }
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during login'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return { login, logout };
};
