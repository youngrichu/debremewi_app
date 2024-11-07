import axios from 'axios';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

// Replace with the actual URL of your WordPress site
const API_URL = 'https://staging.dubaidebremewi.com';

export const useWordPressAPI = () => {
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/?rest_route=/simple-jwt-login/v1/auth`, {
        email: username,
        password
      });

      // Log the response for debugging
      console.log('Login Response:', response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.data.jwt);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login Error:', error.message);
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
        console.error('Login Error:', error);
      }
      // Return an object with success set to false and the error message
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
  };

  return { login, logout };
};
