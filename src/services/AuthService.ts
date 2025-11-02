import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { clearUser } from '../store/userSlice';

export interface UserProfile {
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

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

class AuthServiceClass {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      this.token = token;
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('userToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      this.token = null;
      store.dispatch(clearAuth());
      store.dispatch(clearUser());
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
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

      await this.setToken(token);
      console.log('Token stored successfully');

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
        profileData.is_onboarding_complete = profileData.is_onboarding_complete || profileData.isOnboardingComplete;
        profileData.isOnboardingComplete = profileData.is_onboarding_complete || profileData.isOnboardingComplete;

        return {
          success: true,
          token,
          user: profileData
        };
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
          success: true,
          token,
          message: 'Logged in but failed to fetch profile'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      await this.clearAuth();
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await axios.post(`${API_URL}/?rest_route=/simple-jwt-login/v1/users`, {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        AUTH_KEY: 'debremewi'
      });

      return {
        success: true,
        message: 'Registration successful'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_URL}/wp-json/church-mobile/v1/delete-account`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      await this.clearAuth();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Call the Simple JWT Login plugin's password reset request endpoint
      // This will trigger the WordPress plugin to send a reset code email via FluentSMTP
      const response = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/user/reset_password`, {
        email,
        AUTH_KEY: 'debremewi'
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Password reset request response:', response.data);

      return {
        success: response.data.success || true,
        message: response.data.message || 'Password reset code sent to your email'
      };
    } catch (error) {
      console.error('Request password reset error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Reset request error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        if (error.response?.data?.message) {
          return {
            success: false,
            message: error.response.data.message
          };
        }
      }

      return {
        success: false,
        message: 'Failed to send reset code'
      };
    }
  }

  async resetPassword(email: string, newPassword: string, resetCode: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Based on Simple JWT Login plugin documentation, use the correct endpoint for password reset with code
      // The plugin uses /user/reset_password (singular) for the actual password change operation
      let response;
      
      try {
        // Try the correct Simple JWT Login endpoint format
        response = await axios.put(`${API_URL}/wp-json/simple-jwt-login/v1/user/reset_password`, {
          email,
          code: resetCode,
          new_password: newPassword,
          AUTH_KEY: 'debremewi'
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (primaryError) {
        // If primary endpoint fails with 404, try alternative REST route format
        if (axios.isAxiosError(primaryError) && primaryError.response?.status === 404) {
          console.log('Primary endpoint failed, trying alternative REST route format...');
          response = await axios.put(`${API_URL}/?rest_route=/simple-jwt-login/v1/user/reset_password`, {
            email,
            code: resetCode,
            new_password: newPassword,
            AUTH_KEY: 'debremewi'
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } else {
          throw primaryError;
        }
      }

      console.log('Password reset response:', response.data);

      return {
        success: response.data.success || false,
        message: response.data.message || 'Password reset successfully'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Reset password error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          url: error.config?.url
        });
        
        // Provide specific error messages based on status code
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Password reset endpoint not found. Please ensure the Simple JWT Login plugin has "Change user password" enabled in the WordPress admin settings.'
          };
        }
        
        if (error.response?.data?.message) {
          return {
            success: false,
            message: error.response.data.message
          };
        }
      }

      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }
}

export const AuthService = new AuthServiceClass();
export default AuthService;

// Export individual methods for convenience
export const requestPasswordReset = (email: string) => 
  AuthService.requestPasswordReset(email);

export const resetPassword = (email: string, newPassword: string, resetCode: string) => 
  AuthService.resetPassword(email, newPassword, resetCode);
