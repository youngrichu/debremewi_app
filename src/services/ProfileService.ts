import axios from 'axios';
import { UserProfile } from '../types';
import { API_URL } from '../config';
import { store } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAuth } from '../store/slices/authSlice';
import { clearUser } from '../store/slices/userSlice';
import { validateChildrenData } from '../utils/validation';

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

  private async handleSessionExpired() {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    store.dispatch(clearAuth());
    store.dispatch(clearUser());
    throw new Error('SESSION_EXPIRED');
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<{ data: UserProfile; success: boolean }> {
    try {
      const formData = new FormData();
      const headers = this.getAuthHeaders();

      // Handle photo upload if it exists
      if (profileData.photo && profileData.photo.startsWith('file://')) {
        const uriParts = profileData.photo.split('.');
        const fileType = uriParts[uriParts.length - 1];

        // Log the photo data for debugging
        console.log('Photo upload data:', {
          uri: profileData.photo,
          name: `photo.${fileType}`,
          type: `image/${fileType}`
        });

        formData.append('photo', {
          uri: profileData.photo,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        // Remove the photo from profileData to avoid duplicate sending
        delete profileData.photo;
      }

      // Log the complete formData for debugging
      console.log('FormData contents:', formData);

      // Handle children data
      if (profileData.hasChildren === 'yes' && Array.isArray(profileData.children)) {
        formData.append('has_children', 'yes');
        formData.append('number_of_children', profileData.children.length.toString());
        formData.append('user_children', JSON.stringify(profileData.children));
      } else {
        formData.append('has_children', 'no');
        formData.append('number_of_children', '0');
        formData.append('user_children', JSON.stringify([]));
      }

      // Add other profile data to formData
      Object.keys(profileData).forEach(key => {
        if (!['photo', 'children', 'hasChildren', 'numberOfChildren'].includes(key) && 
            profileData[key] !== null && 
            profileData[key] !== undefined) {
          // Keep original field names as they are
          formData.append(key, profileData[key] as string);
        }
      });

      const response = await axios.post(
        `${API_URL}/wp-json/church-app/v1/update-profile`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          transformRequest: (data) => data,
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        
        // Ensure children data is properly structured
        if (userData.hasChildren === 'yes' && userData.children) {
          userData.children = Array.isArray(userData.children) ? userData.children : [];
        } else {
          userData.children = [];
        }

        return { 
          data: userData,
          success: true 
        };
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
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
        await this.handleSessionExpired();
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