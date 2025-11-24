import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearAuth, setAuthState } from '../store/slices/authSlice';
import { clearUser, setUserData } from '../store/slices/userSlice';
import { AuthService } from '../services/AuthService';
import { efficientTokenRefresh } from '../services/efficientTokenRefresh';

interface AuthContextType {
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Efficient token refresh - no background polling needed
    console.log('Auth provider mounted with efficient token refresh');

    // Optional: Check token status on app start for debugging
    efficientTokenRefresh.getTokenStatus().then(status => {
      console.log('Initial token status:', status);
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);

      if (response.success && response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        dispatch(setAuthState({
          isAuthenticated: true,
          token: response.token
        }));

        if (response.user) {
          dispatch(setUserData(response.user));
        }

        // Token refresh is now handled efficiently on-demand, no service startup needed
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userRegistrationDate']);
      dispatch(clearAuth());
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};