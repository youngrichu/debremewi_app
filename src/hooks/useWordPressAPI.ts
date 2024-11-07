import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useWordPressAPI() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('https://staging.dubaidebremewi.com/?rest_route=/simple-jwt-login/v1/auth', {
        username: email, // Changed from 'email' to 'username' if the server expects this
        password: password
      });
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
        if (error.response?.status === 400) {
          alert('Login failed. Please check your credentials or contact support.');
        }
      } else {
        console.error('Login error:', error);
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await axios.post('https://staging.dubaidebremewi.com/?rest_route=/simple-jwt-login/v1/auth/revoke', {
          JWT: token
        });
      }
      await AsyncStorage.removeItem('userToken');
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const validateToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.post('https://staging.dubaidebremewi.com/?rest_route=/simple-jwt-login/v1/auth/validate', {
          JWT: token
        });
        if (response.data.valid) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const isValid = await validateToken();
        setIsAuthenticated(isValid);
      }
    };
    checkToken();
  }, []);

  // Add more API calls here for other functionalities

  return { login, logout, isAuthenticated };
}
