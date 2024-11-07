import axios from 'axios';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

const API_URL = 'your-api-url';

export const useWordPressAPI = () => {
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      // Log the response for debugging
      console.log('Login Response:', response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
  };

  return { login, logout };
};
