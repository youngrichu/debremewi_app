import apiClient from '../api/client';
import { UserProfile } from '../types/index';
import { API_URL } from '../config';

class ProfileServiceClass {
  async updateProfile(profileData: Partial<UserProfile>): Promise<{ data: UserProfile; success: boolean }> {
    try {
      const formData = new FormData();

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


        console.log('Appending to FormData: user_children =', JSON.stringify(profileData.children));
        formData.append('user_children', JSON.stringify(profileData.children));
      } else {
        formData.append('has_children', 'no');
        formData.append('number_of_children', '0');
        console.log('Appending to FormData: user_children = []');
        formData.append('user_children', JSON.stringify([]));
      }

      // Add other profile data to formData
      Object.keys(profileData).forEach(key => {
        const typedKey = key as keyof UserProfile;

        // Skip special fields handled separately or read-only fields
        if (['photo', 'children', 'hasChildren', 'numberOfChildren', 'id', 'username', 'email', 'profilePhoto', 'profilePhotoUrl', 'avatar_url', 'user_registered', 'countryCode'].includes(key)) {
          return;
        }

        const value = profileData[typedKey];
        if (value !== null && value !== undefined && value !== '') {
          // Send field with original camelCase key
          console.log(`Appending to FormData: ${key} = ${value}`);
          formData.append(key, value as string);
        }
      });

      const response = await apiClient.post(
        '/wp-json/church-app/v1/update-profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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
      const response = await apiClient.get('/wp-json/church-mobile/v1/user-profile');

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