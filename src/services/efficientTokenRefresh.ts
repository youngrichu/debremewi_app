import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshToken, decodeJWT } from './auth';

/**
 * Efficient Token Refresh Manager
 * 
 * How major apps handle token refresh:
 * - Netflix: Only refreshes on 401 errors
 * - Spotify: Reactive refresh with 5-min threshold for critical ops
 * - Instagram: Only checks on app foreground/background transitions
 * - WhatsApp: No background refresh, only on demand
 */

class EfficientTokenRefresh {
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  /**
   * Reactive token refresh - called when API returns 401
   * This is the primary method used by most apps
   */
  async refreshOnDemand(): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new refresh process
    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found for refresh');
        return null;
      }

      console.log('Attempting reactive token refresh...');
      const newToken = await refreshToken(token);
      
      if (newToken) {
        console.log('Reactive token refresh successful');
        return newToken;
      } else {
        console.log('Reactive token refresh failed');
        return null;
      }
    } catch (error) {
      console.error('Reactive token refresh error:', error);
      return null;
    }
  }

  /**
   * Check if token should be refreshed before a critical operation
   * Used sparingly for important user actions
   */
  async shouldRefreshBeforeOperation(minutesBeforeExpiry = 5): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;

      const payload = decodeJWT(token);
      if (!payload || !payload.exp) return false;

      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      const threshold = minutesBeforeExpiry * 60 * 1000;

      const shouldRefresh = timeUntilExpiration < threshold && timeUntilExpiration > 0;
      
      if (shouldRefresh) {
        console.log(`Token expires in ${Math.round(timeUntilExpiration / 1000 / 60)} minutes, refreshing before operation...`);
        const newToken = await this.refreshOnDemand();
        return !!newToken;
      }

      return true; // Token is fine
    } catch (error) {
      console.error('Error checking token before operation:', error);
      return false;
    }
  }

  /**
   * Get token status for debugging/monitoring
   */
  async getTokenStatus() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return { hasToken: false };

      const payload = decodeJWT(token);
      if (!payload || !payload.exp) return { hasToken: true, isValid: false };

      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      return {
        hasToken: true,
        isValid: timeUntilExpiration > 0,
        expiresInMinutes: Math.round(timeUntilExpiration / 1000 / 60),
        isExpiringSoon: timeUntilExpiration < 5 * 60 * 1000 // 5 minutes
      };
    } catch (error) {
      console.error('Error getting token status:', error);
      return { hasToken: false, isValid: false };
    }
  }
}

export const efficientTokenRefresh = new EfficientTokenRefresh();