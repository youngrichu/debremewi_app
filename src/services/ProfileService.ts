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
        transformRequest: (data) => data, // Prevent axios from trying to transform FormData
      });

      if (response.data.success) {
        return response.data.user;
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw error;
    }
  }

  static async getProfile(): Promise<UserProfile> {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get('/wp-json/church-mobile/v1/user-profile');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to get profile');
      }

      // Transform the response data to match your UserProfile interface
      const userData = {
        id: response.data.user.id,
        email: response.data.user.email,
        username: response.data.user.username,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        christianName: response.data.user.christianName,
        gender: response.data.user.gender,
        maritalStatus: response.data.user.maritalStatus,
        hasChildren: response.data.user.hasChildren,
        numberOfChildren: response.data.user.numberOfChildren,
        educationLevel: response.data.user.educationLevel,
        occupation: response.data.user.occupation,
        phoneNumber: response.data.user.phoneNumber,
        residencyCity: response.data.user.residencyCity,
        residenceAddress: response.data.user.residenceAddress,
        emergencyContact: response.data.user.emergencyContact,
        christianLife: response.data.user.christianLife,
        serviceAtParish: response.data.user.serviceAtParish,
        ministryService: response.data.user.ministryService,
        hasFatherConfessor: response.data.user.hasFatherConfessor,
        fatherConfessorName: response.data.user.fatherConfessorName,
        hasAssociationMembership: response.data.user.hasAssociationMembership,
        associationName: response.data.user.associationName,
        residencePermit: response.data.user.residencePermit,
        isOnboardingComplete: response.data.user.isOnboardingComplete,
        // Photo fields
        profilePhoto: response.data.user.profilePhoto,
        profilePhotoUrl: response.data.user.profilePhotoUrl,
      };

      return userData;
    } catch (error) {
      console.error('Get profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }
} 