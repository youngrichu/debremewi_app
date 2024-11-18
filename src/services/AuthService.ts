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
  isOnboardingComplete?: boolean;
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

    console.log('Login response:', response.data);

    if (response.data.success) {
      const token = response.data.data?.jwt || response.data.jwt;
      await AsyncStorage.setItem('userToken', token);

      // Decode token to get user ID
      const tokenData = JSON.parse(atob(token.split('.')[1])) as TokenData;
      console.log('Decoded token data:', tokenData);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      try {
        const userProfileResponse = await axios.get<{ success: boolean; user: UserProfile }>(
          `${API_URL}/wp-json/church-mobile/v1/user-profile`,
          { headers }
        );

        console.log('User profile response:', userProfileResponse.data);

        if (userProfileResponse.data.success && userProfileResponse.data.user) {
          const profileData = userProfileResponse.data.user;

          const userData: UserProfile = {
            id: Number(profileData.id),
            email: profileData.email,
            username: profileData.username,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            christianName: profileData.christianName || '',
            gender: profileData.gender || '',
            maritalStatus: profileData.maritalStatus || '',
            educationLevel: profileData.educationLevel || '',
            occupation: profileData.occupation || '',
            phoneNumber: profileData.phoneNumber || '',
            residencyCity: profileData.residencyCity || '',
            residenceAddress: profileData.residenceAddress || '',
            emergencyContact: profileData.emergencyContact || '',
            christianLife: profileData.christianLife || '',
            serviceAtParish: profileData.serviceAtParish || '',
            ministryService: profileData.ministryService || '',
            hasFatherConfessor: profileData.hasFatherConfessor || '',
            fatherConfessorName: profileData.fatherConfessorName || '',
            hasAssociationMembership: profileData.hasAssociationMembership || '',
            residencePermit: profileData.residencePermit || '',
            profilePhotoUrl: profileData.profilePhoto || profileData.profilePhotoUrl,
            avatar_url: profileData.profilePhoto || profileData.profilePhotoUrl,
            photo: profileData.profilePhoto || profileData.profilePhotoUrl,
            isOnboardingComplete: profileData.isOnboardingComplete
          };

          console.log('Final user data:', userData);

          return {
            success: true,
            token,
            user: userData
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
    console.error('Login error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Server response:', error.response?.data);
      
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
    console.error('Logout error:', error);
    throw error;
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    const response = await apiClient.delete('/wp-json/church-mobile/v1/delete-account');
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to delete account');
    }
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
