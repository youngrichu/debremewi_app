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
      console.log('No token set in NotificationService');
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

      // Sort notifications by date, newest first
      const sortedNotifications = response.data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('Notifications count:', sortedNotifications.length);
      console.log('Unread count:', sortedNotifications.filter(n => n.is_read === '0').length);
      
      return sortedNotifications;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          url: `${API_URL}${ENDPOINTS.notifications}`,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          token: this.token ? 'Token exists' : 'No token', // Debug log token existence
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid token');
        }
        if (error.response?.status === 404) {
          console.error('API endpoint not found');
          return [];
        }
      }
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    if (!this.token) {
      throw new Error('No authentication token found');
    }

    try {
      console.log('Marking notification as read:', notificationId); // Debug log
      const url = `${API_URL}${ENDPOINTS.notificationRead(notificationId)}`;
      console.log('Request URL:', url); // Debug log

      const response = await axios.put(
        url,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.timeout,
        }
      );

      console.log('Mark as read response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid token');
        }
        console.error('Response data:', error.response?.data);
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
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      // Check if token has required fields
      if (!payload.data?.user?.id) return false;
      
      // If there's no expiration, consider it valid
      if (!payload.exp) return true;
      
      // Check expiration if it exists
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static async handleNotificationPress(notification: Notification, navigation: any) {
    try {
      // Mark as read
      await this.markNotificationAsRead(notification.id);

      // Navigate based on notification type
      if (notification.type === 'blog_post' && notification.reference_id) {
        navigation.navigate('BlogPostDetail', { 
          postId: notification.reference_id 
        });
      } else {
        navigation.navigate('Notifications');
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  }

  static async setupPushNotifications() {
    // Request permission and register for push notifications
    const token = await this.registerForPushNotifications();
    
    // Set up notification handler
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data.type === 'blog_post' && data.post_id) {
        // Navigate to the blog post
        // You'll need to implement this navigation logic
      }
    });
  }
} 