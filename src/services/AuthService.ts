import apiClient from '../api/client';
import { User } from '../types';
import axios, { isAxiosError } from 'axios';

export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  console.log('Login service called with:', { username, password });
  try {
    const response = await apiClient.post('/?rest_route=/simple-jwt-login/v1/auth', {
      email: username,
      password,
      AUTH_KEY: 'debremewi'
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.success) {
      return {
        token: response.data.data?.jwt || response.data.jwt,
        user: {
          id: response.data.data?.user?.ID || response.data.user?.ID,
          email: username,
          username: username,
        }
      };
    }
    
    throw new Error(response.data.data?.message || response.data.message || 'Login failed');
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Login error:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
        
        if (error.response.data?.data?.errorCode === 48) {
          throw new Error('Invalid email or password. Please try again.');
        }
      }
    }
    throw error instanceof Error ? error : new Error('Login failed');
  }
};

export const register = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    // Register the user with Simple JWT Login plugin
    const registerResponse = await apiClient.post('/?rest_route=/simple-jwt-login/v1/users', {
      email: username,
      password: password,
      AUTH_KEY: 'debremewi',
      role: 'subscriber',
      user_login: username,
      user_email: username,
      display_name: username.split('@')[0], // Use part before @ as display name
    });

    console.log('Registration response:', registerResponse.data);

    if (registerResponse.data.success) {
      return {
        token: registerResponse.data.jwt,
        user: {
          id: parseInt(registerResponse.data.user.ID),
          email: registerResponse.data.user.user_email,
          username: registerResponse.data.user.user_login,
        }
      };
    }

    throw new Error(registerResponse.data.message || 'Registration failed');
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        
        if (error.response.data?.data?.message) {
          throw new Error(error.response.data.data.message);
        }
      }
    }
    throw error instanceof Error ? error : new Error('Registration failed');
  }
};

export const verifyLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await apiClient.post('/?rest_route=/simple-jwt-login/v1/auth', {
      email: username,
      password,
      AUTH_KEY: 'debremewi'
    });
    
    return response.data.success === true;
  } catch (error) {
    console.error('Verification login failed:', error);
    if (isAxiosError(error)) {
      console.error('Verification response:', error.response?.data);
    }
    return false;
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/simple-jwt-login/v1/auth/revoke');
    console.log('Logout successful');
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Logout error:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
      }
    }
  }
};

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  code?: string; // The reset code returned when not sending email
}

// Request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/?rest_route=/simple-jwt-login/v1/user/reset_password', {
      email
    });

    console.log('Reset password request response:', response.data);

    if (response.data.success) {
      return {
        success: true,
        message: 'Password reset link sent successfully.'
      };
    }

    throw new Error(response.data.message || 'Failed to request password reset');
  } catch (error) {
    console.error('Password reset request error:', error);
    if (isAxiosError(error)) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error('Failed to request password reset');
  }
};

// Reset password with JWT
export const resetPassword = async (email: string, newPassword: string, jwt: string): Promise<boolean> => {
  try {
    const response = await apiClient.put(
      `/?rest_route=/simple-jwt-login/v1/user/reset_password&email=${encodeURIComponent(email)}&new_password=${encodeURIComponent(newPassword)}`,
      {
        jwt
      }
    );

    console.log('Password reset response:', response.data);

    return response.data.success === true;
  } catch (error) {
    console.error('Password reset error:', error);
    if (isAxiosError(error)) {
      console.error('Reset password error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error('Failed to reset password');
  }
};
