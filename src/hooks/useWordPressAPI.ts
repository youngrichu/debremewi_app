import axios from 'axios';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

const API_URL = 'https://staging.dubaidebremewi.com';

export const useWordPressAPI = () => {
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/?rest_route=/simple-jwt-login/v1/auth`, {
        email: username,
        password
      });

      console.log('Login Response:', response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.data.jwt);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.data.data.message || 'Login failed' };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login Error:', error.message);
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
        console.error('Login Error:', error);
      }
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
  };

  return { login, logout };
};
