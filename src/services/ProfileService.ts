import apiClient from '../api/client';
import { UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ProfileService {
  static async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const formData = new FormData();

      // Handle photo upload if it exists and is a file URI
      if (profileData.photo && profileData.photo.startsWith('file://')) {
        // Get the file extension
        const uriParts = profileData.photo.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('photo', {
          uri: profileData.photo,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Add other profile data to formData
      Object.keys(profileData).forEach(key => {
        // Skip photo as it's handled separately
        if (key !== 'photo' && profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key] as string);
        }
      });

      const response = await apiClient.post('/wp-json/church-app/v1/update-profile', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        return response.data.user;
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }

  static async getProfile(): Promise<UserProfile> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching profile with token:', token);
      const response = await apiClient.get('/wp-json/church-mobile/v1/user-profile');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to get profile');
      }

      // Transform the response data to match your UserProfile interface
      const userData = {
        ...response.data.user,
        isOnboardingComplete: response.data.user.isOnboardingComplete || response.data.user.is_onboarding_complete,
        is_onboarding_complete: response.data.user.isOnboardingComplete || response.data.user.is_onboarding_complete,
      };

      return userData;
    } catch (error: any) {
      console.error('Get profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch profile data');
    }
  }
}