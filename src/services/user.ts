import axios from 'axios';
import { API_URL } from '../config';

export const fetchUserProfile = async (token: string) => {
  try {
    console.log('Fetching user profile with token:', token.substring(0, 10) + '...');
    const response = await axios.get(`${API_URL}/wp-json/church-app/v1/user-profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('User profile response:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}; 