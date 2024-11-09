import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { API_URL, ENDPOINTS, EXPO_PROJECT_ID, API_CONFIG } from '../config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: string;
  created_at: string;
  user_id: string;
  reference_id?: string;
  reference_type?: string;
  excerpt?: string;
  featured_image?: {
    url: string;
    alt?: string;
  };
  blog_post?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featured_image?: {
      url: string;
      alt?: string;
    };
  };
}

export class NotificationService {
  private static token: string | null = null;

  static setAuthToken(token: string) {
    this.token = token;
  }

  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID, // Add your Expo project ID here
      })).data;

      // Register token with WordPress
      await this.registerTokenWithWordPress(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  static async registerTokenWithWordPress(token: string) {
    try {
      const jwt = await AsyncStorage.getItem('userToken');
      if (!jwt) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.post('/?rest_route=/simple-jwt-login/v1/notifications/register-token', {
        token,
        jwt
      });

      return response.data.success;
    } catch (error) {
      console.error('Failed to register token with WordPress:', error);
      throw error;
    }
  }

  static async getNotifications(): Promise<Notification[]> {
    if (!this.token) {
      console.log('No token set in NotificationService - skipping notification fetch');
      return [];
    }

    // Log the token being validated (safely)
    console.log('Validating token:', this.token ? `${this.token.substring(0, 10)}...` : 'none');

    // Validate token before making the request
    if (!this.isValidToken(this.token)) {
      console.log('Invalid or expired token - skipping notification fetch');
      // Log the token structure for debugging
      try {
        const parts = this.token.split('.');
        console.log('Token structure:', {
          partsCount: parts.length,
          part1Length: parts[0]?.length,
          part2Length: parts[1]?.length,
          part3Length: parts[2]?.length,
        });
      } catch (e) {
        console.error('Error analyzing token structure:', e);
      }
      return [];
    }

    try {
      const url = `${API_URL}${ENDPOINTS.notifications}`;
      console.log('Fetching notifications from:', url);

      const response = await axios.get<Notification[]>(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.timeout,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        const sortedNotifications = response.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return sortedNotifications;
      }

      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Only log error if we have a token (expected behavior)
        if (this.token) {
          console.error('Notification fetch error:', {
            url: `${API_URL}${ENDPOINTS.notifications}`,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
          });
        }

        if (error.response?.status === 401) {
          return []; // Silently return empty array for unauthorized
        }
      }
      return []; // Return empty array instead of throwing
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!this.token) {
      throw new Error('No authentication token found');
    }

    try {
      console.log('Marking notification as read:', notificationId);
      const url = `${API_URL}${ENDPOINTS.notificationRead(notificationId)}`;
      console.log('Request URL:', url);

      // Validate token before making request
      if (!this.isValidToken(this.token)) {
        throw new Error('Invalid token');
      }

      const response = await axios.put(
        url,
        {}, // empty body
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.timeout,
        }
      );

      console.log('Mark as read response:', response.data);

      // Check if the response indicates success
      if (response.status === 200 || response.status === 204) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error marking notification as read:', {
        notificationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error) ? error.response?.data : null,
      });

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid token');
        }
        if (error.response?.status === 404) {
          throw new Error('Notification not found');
        }
      }
      throw error;
    }
  }

  static async scheduleLocalNotification(title: string, body: string, trigger?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: trigger || null,
    });
  }

  private static isValidToken(token: string): boolean {
    try {
      // Debug log the token format
      console.log('Validating token format:', {
        length: token.length,
        hasBearerPrefix: token.startsWith('Bearer '),
      });

      // Remove 'Bearer ' prefix if it exists
      const cleanToken = token.replace('Bearer ', '');
      
      const parts = cleanToken.split('.');
      console.log('Token parts count:', parts.length);

      if (parts.length !== 3) {
        console.log('Invalid token structure: expected 3 parts');
        return false;
      }

      // Use a more robust base64 decode function
      const base64Decode = (str: string) => {
        try {
          // Add padding if needed
          const padding = '='.repeat((4 - str.length % 4) % 4);
          const base64 = (str + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          
          return JSON.parse(decodeURIComponent(escape(atob(base64))));
        } catch (e) {
          console.error('Base64 decode error:', e);
          return null;
        }
      };

      const payload = base64Decode(parts[1]);
      console.log('Decoded payload:', payload);

      if (!payload) {
        console.log('Failed to decode token payload');
        return false;
      }

      // Update validation to match your token structure
      const hasUserData = payload.id || payload.email;
      if (!hasUserData) {
        console.log('No user data found in token');
        return false;
      }

      // Check issued at time if it exists
      if (payload.iat) {
        const issuedAt = payload.iat * 1000; // Convert to milliseconds
        const tokenAge = Date.now() - issuedAt;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        
        const isExpired = tokenAge > maxAge;
        console.log('Token age check:', {
          issuedAt: new Date(issuedAt).toISOString(),
          currentTime: new Date().toISOString(),
          ageInDays: tokenAge / (24 * 60 * 60 * 1000),
          isExpired
        });
        
        return !isExpired;
      }

      // If no issuedAt time, consider it valid
      console.log('No issuedAt time found, considering token valid');
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static async handleNotificationPress(notification: Notification, navigation: any) {
    try {
      if (!this.token) {
        throw new Error('No authentication token found');
      }

      // First mark the notification as read
      if (notification.is_read === '0') {
        console.log('Marking notification as read:', notification.id);
        await this.markNotificationAsRead(notification.id);
      }

      // Handle blog post notifications
      if (notification.type === 'blog_post' && notification.blog_post) {
        navigation.navigate('BlogPostDetail', {
          postId: notification.blog_post.id,
          post: notification.blog_post // Pass the blog post data
        });
      } else {
        console.log('No specific navigation for notification type:', notification.type);
      }

      return true;
    } catch (error) {
      console.error('Error in handleNotificationPress:', error);
      throw error;
    }
  }

  static async setupPushNotifications() {
    // Request permission and register for push notifications
    const token = await this.registerForPushNotifications();
    
    // Set up notification handler for when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data;
        
        // Configure notification presentation
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          // Show image if available
          shouldPresentImage: !!data.featured_image,
        };
      },
    });

    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const data = response.notification.request.content.data;
        
        if (data.type === 'blog_post' && data.blog_post?.id) {
          // Navigate to the blog post
          // We'll need to access navigation here, so we'll use a navigation ref
          if (navigationRef.current) {
            navigationRef.current.navigate('BlogPostDetail', {
              postId: data.blog_post.id,
              post: data.blog_post // Pass the blog post data if available
            });
          }
        }
      } catch (error) {
        console.error('Error handling notification response:', error);
      }
    });

    return token;
  }
} 