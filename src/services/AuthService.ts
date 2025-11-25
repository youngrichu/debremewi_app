import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
  associationName?: string;
  residencePermit: string;
  profilePhotoUrl?: string;
  avatar_url?: string;
  photo?: string;
  is_onboarding_complete?: boolean;
  user_registered?: string; // Registration date from WordPress
  hasChildren?: string;
  numberOfChildren?: string;
  children?: any[];
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
  email?: string;
  username?: string;
  user_registered?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  jwt?: string;
  token?: string;
  message?: string;
}

export interface TokenValidationResponse {
  success: boolean;
  valid?: boolean;
  message?: string;
}

class AuthServiceClass {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpirationTime: number | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  // Decode JWT token to extract expiration time
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Check if token is expired or will expire soon (within 5 minutes)
  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded) {
      console.log('Token could not be decoded, considering expired');
      return true;
    }

    // If token has explicit expiration time, use it
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutes buffer
      const isExpired = decoded.exp < (currentTime + bufferTime);
      console.log(`Token expiration check: exp=${decoded.exp}, current=${currentTime}, expired=${isExpired}`);
      return isExpired;
    }

    // If no exp field (like Simple JWT Login), check based on issued time
    // Simple JWT Login tokens are typically valid for the duration set in WordPress settings
    // We'll be more conservative and only consider tokens expired if they're very old
    if (decoded.iat) {
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenAge = currentTime - decoded.iat;

      // REMOVED: Hardcoded 23-hour expiration check.
      // We now rely on the server to reject the token if it's expired.
      // This allows for "forever" sessions if the server supports it or if we keep refreshing.
      console.log(`Token age check: iat=${decoded.iat}, age=${Math.floor(tokenAge / 60)}min. Assuming valid until server rejects.`);
      return false;
    }

    // If we can't determine expiration, assume token is still valid
    // This prevents unnecessary refresh attempts on fresh tokens
    console.log('Token has no expiration info (no exp or iat), assuming valid');
    return false;
  }

  // Validate token with server
  async validateToken(token?: string): Promise<boolean> {
    try {
      const tokenToValidate = token || await this.getToken();
      if (!tokenToValidate) return false;

      const response = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth/validate`, {
        JWT: tokenToValidate,
        AUTH_KEY: 'debremewi'
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (this.token && !this.isTokenExpired(this.token)) {
      return this.token;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && !this.isTokenExpired(token)) {
        this.token = token;
        return token;
      } else if (token) {
        // Token exists but is expired, only try to refresh if we have a refresh token
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          console.log('Token expired, attempting refresh...');
          return await this.refreshTokenIfNeeded();
        } else {
          console.log('Token expired but no refresh token available');
          // Clear the expired token but don't clear full auth state
          // This allows the user to remain logged in until they make an API call
          this.token = null;
          await AsyncStorage.removeItem('userToken');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('userToken', token);
      this.token = token;

      // Extract expiration time from token
      const decoded = this.decodeJWT(token);
      if (decoded && decoded.exp) {
        this.tokenExpirationTime = decoded.exp * 1000; // Convert to milliseconds
      }
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', refreshToken);
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Error setting refresh token:', error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.refreshToken) return this.refreshToken;

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      this.refreshToken = refreshToken;
      return refreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Refresh token functionality
  async refreshTokenIfNeeded(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.log('No refresh token available - Simple JWT Login may not support refresh tokens');
        // Don't clear auth immediately - let the token expire naturally
        // This prevents logout on fresh logins when refresh tokens aren't provided
        return null;
      }

      const response = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth/refresh`, {
        JWT: refreshToken,
        AUTH_KEY: 'debremewi'
      });

      if (response.data.success && (response.data.jwt || response.data.token)) {
        const newToken = response.data.jwt || response.data.token;
        await this.setToken(newToken);

        // If a new refresh token is provided, store it
        if (response.data.refresh_token) {
          await this.setRefreshToken(response.data.refresh_token);
        }

        console.log('Token refreshed successfully');
        return newToken;
      } else {
        console.log('Token refresh failed:', response.data.message);
        await this.clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearAuth();
      return null;
    }
  }


  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken', 'userRegistrationDate']);
      this.token = null;
      this.refreshToken = null;
      this.tokenExpirationTime = null;
      this.isRefreshing = false;
      this.refreshPromise = null;
      store.dispatch(clearAuth());
      store.dispatch(clearUser());
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  }

  async login(identifier: string, password: string): Promise<LoginResponse> {
    try {
      // Clear any existing auth state to ensure a fresh login
      // This prevents sending old/invalid tokens in the Authorization header
      await this.clearAuth();

      // Determine if identifier is email or username
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const payload: any = {
        password,
        AUTH_KEY: 'debremewi'
      };

      if (isEmail) {
        payload.email = identifier;
      } else {
        payload.username = identifier;
      }

      console.log('Attempting login with payload:', JSON.stringify({ ...payload, password: '***' }));

      const loginResponse = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth`, payload);

      console.log('Raw login response:', JSON.stringify(loginResponse.data, null, 2));

      if (!loginResponse.data.success) {
        throw new Error(loginResponse.data.message || 'Login failed');
      }

      const token = loginResponse.data.data?.jwt || loginResponse.data.jwt;
      if (!token) {
        throw new Error('No token received from server');
      }

      await this.setToken(token);

      // Store refresh token if provided
      const refreshToken = loginResponse.data.data?.refresh_token || loginResponse.data.refresh_token;
      if (refreshToken) {
        await this.setRefreshToken(refreshToken);
      }

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
      let emailToRegister = userData.email;
      let username: string;

      // Check if email is provided
      if (!emailToRegister || !emailToRegister.trim()) {
        // No email provided: generate both temporary email AND username
        // Format: noemail.{timestamp}.{random}@debremewi.com
        // Username format: firstname.lastname.random
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        emailToRegister = `noemail.${timestamp}.${random}@debremewi.com`;

        const cleanFirstName = userData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLastName = userData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000);
        username = `${cleanFirstName}.${cleanLastName}.${randomSuffix}`;

        console.log('No email provided, using placeholder email:', emailToRegister);
        console.log('Generated username:', username);
      } else {
        // Email provided: use the email as the username
        username = emailToRegister;
        console.log('Email provided, using as username:', username);
      }

      const response = await axios.post(`${API_URL}/?rest_route=/simple-jwt-login/v1/users`, {
        email: emailToRegister,
        user_login: username, // Use email as username if provided, otherwise generated username
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        AUTH_KEY: 'debremewi'
      });

      return {
        success: true,
        message: 'Registration successful',
        email: emailToRegister, // Return the email used for registration
        username: username, // Return the username (email if provided, or generated)
        user_registered: response.data.user?.user_registered // Return the registration date
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

      await axios.delete(`${API_URL}/wp-json/simple-jwt-login/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        data: {
          AUTH_KEY: 'debremewi'
        }
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

  // Setup axios interceptors for automatic token management
  setupAxiosInterceptors(): void {
    // Request interceptor to add token to headers
    axios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // If Authorization header is already set (e.g. during login), don't overwrite it
        if (config.headers && config.headers.Authorization) {
          return config;
        }

        const token = await this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Check if error is due to expired token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log('401 error detected, attempting token refresh...');
            const newToken = await this.refreshTokenIfNeeded();

            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              // Refresh failed, redirect to login
              console.log('Token refresh failed, clearing auth...');
              await this.clearAuth();
              // You might want to emit an event here to redirect to login screen
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('Error during token refresh:', refreshError);
            await this.clearAuth();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const AuthService = new AuthServiceClass();

// Initialize axios interceptors
AuthService.setupAxiosInterceptors();

export default AuthService;

// Export individual methods for convenience
export const requestPasswordReset = (email: string) =>
  AuthService.requestPasswordReset(email);

export const resetPassword = (email: string, newPassword: string, resetCode: string) =>
  AuthService.resetPassword(email, newPassword, resetCode);

export const deleteAccount = () => AuthService.deleteAccount();
