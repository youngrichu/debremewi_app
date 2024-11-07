import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getCachedData = async (key: string) => {
  try {
    const cachedData = await AsyncStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

export const clearCache = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
