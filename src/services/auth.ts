import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
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
      
      const profileResponse = await axios.get(`${API_URL}/wp-json/church-mobile/v1/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile response:', profileResponse.data);

      return {
        success: true,
        user: {
          ...profileResponse.data.user,
          isOnboardingComplete: profileResponse.data.user.isOnboardingComplete || false,
        },
        token: token
      };
    }

    return {
      success: false,
      message: response.data.message || 'Invalid credentials'
    };

  } catch (error) {
    console.error('Login error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.log('Error response:', error.response?.data);
      return {
        success: false,
        message: errorMessage
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userToken');
    
    delete axios.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const register = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_URL}/wp-json/wp/v2/users/register`, userData);

    if (response.data.success) {
      return {
        success: true,
        message: 'Registration successful'
      };
    }

    return {
      success: false,
      message: response.data.message || 'Registration failed'
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return {
        success: false,
        message: errorMessage
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
};

export const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // First get a JWT token
    const authResponse = await axios.post(`${API_URL}/wp-json/simple-jwt-login/v1/auth`, {
      email,
      password: newPassword,
      AUTH_KEY: 'debremewi'
    });

    console.log('Auth response:', authResponse.data);

    if (!authResponse.data.success) {
      return {
        success: false,
        message: authResponse.data.message || 'Authentication failed'
      };
    }

    const jwt = authResponse.data.data?.jwt;

    // Now use the JWT to reset the password
    const response = await axios.put(
      `${API_URL}/?rest_route=/simple-jwt-login/v1/user/reset_password`,
      {
        email,
        new_password: newPassword,
        jwt,
        AUTH_KEY: 'debremewi'
      }
    );

    console.log('Password reset response:', response.data);

    if (response.data.success) {
      return {
        success: true,
        message: 'Password reset successful'
      };
    }

    return {
      success: false,
      message: response.data.message || 'Password reset failed'
    };

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Reset password error details:', {
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
      message: 'Failed to reset password'
    };
  }
};

export const verifyEmail = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_URL}/wp-json/wp/v2/users/verify-email`, {
      email
    });

    return {
      success: response.data.success,
      message: response.data.message
    };

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      return {
        success: false,
        message: errorMessage
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
}; 