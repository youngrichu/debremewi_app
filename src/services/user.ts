import axios from 'axios';
import { API_URL } from '../config';

export const fetchUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/wp-json/church-mobile/v1/user-profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}; 