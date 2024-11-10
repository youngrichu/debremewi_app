import apiClient from '../api/client';
import { UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileService = {
  async updateProfile(profileData: Partial<UserProfile>) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      // Update profile using the correct endpoint
      const response = await apiClient.post('/wp-json/church-mobile/v1/user-profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error('Failed to update profile');
      }

      return response.data.user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await apiClient.get('/wp-json/church-mobile/v1/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error('Failed to get profile');
      }

      return response.data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
}; 