import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  christianName: string;
  gender: string;
  maritalStatus: string;
  educationLevel: string;
  occupation: string;
  phoneNumber: string;
  residencyCity: string;
  residenceAddress: string;
  emergencyContact: string;
  christianLife: string;
  serviceAtParish: string;
  ministryService: string;
  hasFatherConfessor: string;
  fatherConfessorName: string;
  hasAssociationMembership: string;
  residencePermit: string;
  profilePhotoUrl?: string;
  avatar_url?: string;
  photo?: string;
  is_onboarding_complete?: boolean;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

interface TokenData {
  id: string;
  email: string;
  username: string;
  iat: number;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth`, {
      email,
      password,
      AUTH_KEY: 'debremewi'
    });

    console.log('Raw login response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      const token = response.data.data?.jwt || response.data.jwt;
      await AsyncStorage.setItem('userToken', token);

      // Set headers for subsequent requests
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      try {
        console.log('Fetching user profile...');
        const userProfileResponse = await axios.get(
          `${API_URL}/wp-json/church-mobile/v1/user-profile`,
          { headers }
        );

        console.log('Raw profile API response:', JSON.stringify(userProfileResponse.data, null, 2));

        if (userProfileResponse.data.success && userProfileResponse.data.user) {
          const profileData = userProfileResponse.data.user;
          console.log('Raw profile data from API:', JSON.stringify(profileData, null, 2));

          // Return the raw profile data without transformation
          return {
            success: true,
            token,
            user: profileData
          };
        }

        // Fallback to token data if profile fetch succeeds but data is invalid
        return {
          success: true,
          token,
          user: {
            id: Number(tokenData.id),
            email: tokenData.email,
            username: tokenData.username,
            firstName: '',
            lastName: '',
            christianName: '',
            gender: '',
            maritalStatus: '',
            educationLevel: '',
            occupation: '',
            phoneNumber: '',
            residencyCity: '',
            residenceAddress: '',
            emergencyContact: '',
            christianLife: '',
            serviceAtParish: '',
            ministryService: '',
            hasFatherConfessor: '',
            fatherConfessorName: '',
            hasAssociationMembership: '',
            residencePermit: ''
          }
        };

      } catch (error) {
        console.error('Profile fetch error:', error);
        // Return basic user data from token if profile fetch fails
        return {
          success: true,
          token,
          user: {
            id: Number(tokenData.id),
            email: tokenData.email,
            username: tokenData.username,
            firstName: '',
            lastName: '',
            christianName: '',
            gender: '',
            maritalStatus: '',
            educationLevel: '',
            occupation: '',
            phoneNumber: '',
            residencyCity: '',
            residenceAddress: '',
            emergencyContact: '',
            christianLife: '',
            serviceAtParish: '',
            ministryService: '',
            hasFatherConfessor: '',
            fatherConfessorName: '',
            hasAssociationMembership: '',
            residencePermit: ''
          }
        };
      }
    }

    return {
      success: false,
      message: response.data.data?.message || response.data.message || 'Login failed'
    };

  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Server error. Please try again later.'
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }

    return {
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    throw new Error('Failed to logout');
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No authentication token found');

    await axios.delete(`${API_URL}/wp-json/church-mobile/v1/delete-account`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    throw new Error('Failed to delete account');
  }
};
