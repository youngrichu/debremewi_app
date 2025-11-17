import { useCallback } from 'react';
import { efficientTokenRefresh } from '../services/efficientTokenRefresh';

/**
 * Hook for handling token refresh in critical operations
 * 
 * Usage:
 * const { ensureValidToken } = useTokenRefresh();
 * 
 * const handleCriticalAction = async () => {
 *   const tokenIsValid = await ensureValidToken();
 *   if (!tokenIsValid) {
 *     // Show login prompt or handle refresh failure
 *     return;
 *   }
 *   // Proceed with critical operation
 * };
 */
export const useTokenRefresh = () => {
  const ensureValidToken = useCallback(async (minutesBeforeExpiry = 5): Promise<boolean> => {
    try {
      return await efficientTokenRefresh.shouldRefreshBeforeOperation(minutesBeforeExpiry);
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      return false;
    }
  }, []);

  const getTokenStatus = useCallback(async () => {
    return await efficientTokenRefresh.getTokenStatus();
  }, []);

  return {
    ensureValidToken,
    getTokenStatus
  };
};