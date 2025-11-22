import axios from 'axios';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

const API_URL = 'https://dubaidebremewi.com/wp-json';

export const login = async (username, password) => {
  try {
    const url = `${API_URL}/jwt-auth/v1/token`;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    const payload = {
      "username": username,
      "password": password
    };

    const response = await axios.post(url, payload, { headers });

    if (response.status === 200) {
      await AsyncStorage.setItem('userToken', response.data.token);
      return { success: true, message: 'Login successful' };
    } else {
      console.error(`Login Error: ${response.status}`);
      console.error(`Server Response: ${JSON.stringify(response.data)}`);
      return { success: false, message: 'Login failed' };
    }
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
};
