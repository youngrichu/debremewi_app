import axios from 'axios';
import { UserProfile } from '../types';
import { API_URL } from '../config';
import { store } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileServiceClass {
  private getAuthHeaders() {
    const state = store.getState();
    const token = state.auth.token;
    
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    } : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const formData = new FormData();
      const headers = this.getAuthHeaders();

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

      const response = await axios.post(
        `${API_URL}/wp-json/church-mobile/v1/update-profile`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => data,
        }
      );

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
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/wp-json/church-mobile/v1/user-profile`,
        { headers }
      );

      if (response.data.success) {
        return response.data.user;
      }

      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error: any) {
      console.error('Get profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch profile'
      );
    }
  }
}

export const ProfileService = new ProfileServiceClass();
export default ProfileService;