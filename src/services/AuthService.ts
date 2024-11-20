import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import apiClient from '../api/client';

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
    // Step 1: Get JWT token
    const loginResponse = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth`, {
      email,
      password,
      AUTH_KEY: 'debremewi'
    });

    console.log('Raw login response:', JSON.stringify(loginResponse.data, null, 2));

    if (!loginResponse.data.success) {
      throw new Error(loginResponse.data.message || 'Login failed');
    }

    const token = loginResponse.data.data?.jwt || loginResponse.data.jwt;
    if (!token) {
      throw new Error('No token received from server');
    }

    // Step 2: Store token
    await AsyncStorage.setItem('userToken', token);
    console.log('Token stored successfully:', token);

    // Step 3: Set up headers for profile request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      console.log('Fetching user profile with token:', token);
      const userProfileResponse = await axios.get(
        `${API_URL}/wp-json/church-mobile/v1/user-profile`,
        { headers }
      );

      console.log('Profile API response:', JSON.stringify(userProfileResponse.data, null, 2));

      if (!userProfileResponse.data?.success) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = userProfileResponse.data.user;
      
      // Ensure consistent onboarding flag
      profileData.is_onboarding_complete = profileData.is_onboarding_complete || profileData.isOnboardingComplete;
      profileData.isOnboardingComplete = profileData.is_onboarding_complete || profileData.isOnboardingComplete;

      return {
        success: true,
        token,
        user: profileData
      };
    } catch (profileError) {
      console.error('Profile fetch error:', profileError);
      // Even if profile fetch fails, return success with token
      return {
        success: true,
        token,
        message: 'Logged in but failed to fetch profile'
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    await AsyncStorage.removeItem('userToken');
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
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
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.delete(`${API_URL}/wp-json/church-mobile/v1/delete-account`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await logout();
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
