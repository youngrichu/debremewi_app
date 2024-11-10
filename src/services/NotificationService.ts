import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';
import { API_URL } from '../config';

export const NotificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token set in NotificationService - skipping notification fetch');
        return [];
      }

      const response = await apiClient.get('/wp-json/church-app/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Raw notifications response:', response);

      if (Array.isArray(response.data)) {
        // Filter out duplicate notifications
        const uniqueNotifications = response.data.reduce((acc: Notification[], curr: Notification) => {
          // Check if we already have a notification with the same title and created_at timestamp
          const isDuplicate = acc.some(notification => 
            notification.title === curr.title && 
            Math.abs(new Date(notification.created_at).getTime() - new Date(curr.created_at).getTime()) < 60000 // Within 1 minute
          );

          if (!isDuplicate) {
            acc.push({
              ...curr,
              is_read: curr.is_read?.toString() || '0'
            });
          }

          return acc;
        }, []);

        // Sort by created_at in descending order (newest first)
        return uniqueNotifications.sort((a: Notification, b: Notification) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      console.warn('Unexpected response format:', response.data);
      return [];

    } catch (error: any) {
      // Log the full error for debugging
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        console.log('Notifications endpoint not found - feature might not be enabled');
        return [];
      }
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token set in NotificationService - cannot mark as read');
        return false;
      }

      const response = await apiClient.put(
        `/wp-json/church-app/v1/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Mark as read response:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async handleNotificationPress(notification: Notification, navigation: any): Promise<void> {
    try {
      // Mark the notification as read
      if (notification.is_read === '0') {
        await this.markAsRead(notification.id);
      }

      // Navigate based on notification type
      if (notification.type === 'event' && notification.reference_id) {
        navigation.navigate('EventDetails', { eventId: parseInt(notification.reference_id, 10) });
      } else if (notification.type === 'post' && notification.reference_url) {
        // For blog posts, you might need to fetch the post data first
        const postId = notification.reference_id;
        const response = await apiClient.get(`/wp-json/wp/v2/posts/${postId}?_embed`);
        navigation.navigate('BlogPostDetail', { post: response.data });
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => n.is_read === '0').length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}; 