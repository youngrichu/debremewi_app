import { NavigationProp } from '@react-navigation/native';
import { store } from '../store';
import { markNotificationAsRead } from '../store/slices/notificationsSlice';

interface NotificationData {
  id: string;
  type?: string;
  reference_id?: string;
  reference_url?: string;
}

export class NotificationService {
  static async handleNotificationPress(
    notification: NotificationData, 
    navigation: NavigationProp<any>
  ) {
    try {
      const result = await store.dispatch(markNotificationAsRead(notification.id)).unwrap();
      
      if (result) {
        if (notification.reference_url) {
          // Handle external URLs or deep links
        } else if (notification.type === 'blog_post' && notification.reference_id) {
          navigation.navigate('BlogPostDetail', { id: notification.reference_id });
        } else {
          navigation.navigate('Notifications');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error handling notification:', error);
      return false;
    }
  }
} 