import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, ENDPOINTS, EXPO_PROJECT_ID } from '../config';
import { store } from '../store';
import { markNotificationAsRead } from '../store/slices/notificationsSlice';
import { navigationRef } from '../navigation/navigationRef';
import * as Linking from 'expo-linking';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
});

// Initialize notification channels for Android
export const initializeNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      sound: true,
    });

    // Channel for high-priority notifications
    await Notifications.setNotificationChannelAsync('high-priority', {
      name: 'Important Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      sound: true,
    });

    // Channel for events
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Events',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: true,
    });

    // Channel for blog posts
    await Notifications.setNotificationChannelAsync('blog', {
      name: 'Blog Posts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: true,
    });

    // Channel for announcements
    await Notifications.setNotificationChannelAsync('announcements', {
      name: 'Announcements',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9800',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: true,
    });
  }
};

const handleDeepLink = (url: string) => {
  try {
    console.log('Handling deep link:', url);
    // Remove the scheme from the URL
    const path = url.replace('dubaidebremewi://', '');
    const [screen, id] = path.split('/');
    
    // Add delay to ensure navigation is ready
    setTimeout(() => {
      switch (screen) {
        case 'events':
          console.log('Navigating to event:', id);
          navigationRef.navigate('EventDetails', { eventId: id });
          break;
        case 'blog':
          console.log('Navigating to blog post:', id);
          navigationRef.navigate('BlogPostDetail', { postId: id });
          break;
        case 'announcements':
          console.log('Navigating to announcement:', id);
          navigationRef.navigate('AnnouncementDetail', { id });
          break;
        default:
          console.log('Unknown screen type:', screen);
          navigationRef.navigate('Notifications');
      }
    }, 500);
  } catch (error) {
    console.error('Error handling deep link:', error);
    navigationRef.navigate('Notifications');
  }
};

// Register for push notifications
export const registerForPushNotificationsAsync = async () => {
  let token;

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  // Initialize notification channels
  await initializeNotifications();

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

  try {
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: EXPO_PROJECT_ID 
    })).data;
    console.log('Got push token:', token);

    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      console.log('Attempting to register push token with userToken');
      const response = await axios.post(
        `${API_URL}${ENDPOINTS.registerToken}`,
        { 
          token,
          device_type: Platform.OS
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Token registration response:', response.data);
      if (!response.data.success) {
        console.error('Token registration failed:', response.data.message || 'Unknown error');
      }
    } else {
      console.log('No userToken found in AsyncStorage, skipping push token registration');
    }
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
  }

  return token;
};

// Add notification response listener
export const addNotificationResponseListener = () => {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    try {
      const data = response.notification.request.content.data;
      console.log('🔔 Notification clicked - Full response:', JSON.stringify(response, null, 2));
      console.log('📦 Notification data:', JSON.stringify(data, null, 2));

      // First handle the navigation, then mark as read
      const handleNavigation = async () => {
        try {
          // Ensure we have the required data
          if (!data) {
            console.error('❌ No notification data available');
            navigationRef.navigate('Notifications');
            return;
          }

          // Log the current navigation state
          console.log('🧭 Current navigation state:', navigationRef.getCurrentRoute());

          if (data.type === 'event' && data.reference_id) {
            console.log('🎯 Attempting to navigate to event:', data.reference_id);
            // Force navigation to Home first, then to EventDetails
            navigationRef.reset({
              index: 0,
              routes: [
                { name: 'Home' },
                { 
                  name: 'EventDetails',
                  params: { eventId: data.reference_id }
                }
              ],
            });
            return true;
          }

          if (data.type === 'blog_post' && data.reference_id) {
            console.log('🎯 Attempting to navigate to blog post:', data.reference_id);
            navigationRef.reset({
              index: 0,
              routes: [
                { name: 'Home' },
                { 
                  name: 'BlogPostDetail',
                  params: { postId: data.reference_id }
                }
              ],
            });
            return true;
          }

          if (data.reference_url) {
            console.log('🔗 Handling deep link:', data.reference_url);
            handleDeepLink(data.reference_url);
            return true;
          }

          console.log('⚠️ No specific navigation path found');
          return false;
        } catch (error) {
          console.error('❌ Navigation error:', error);
          return false;
        }
      };

      // Execute navigation
      const navigationSuccessful = await handleNavigation();

      // Mark notification as read after navigation attempt
      if (data?.id) {
        try {
          await store.dispatch(markNotificationAsRead(data.id)).unwrap();
          console.log('✅ Marked notification as read:', data.id);
        } catch (error) {
          console.error('❌ Failed to mark notification as read:', error);
        }
      }

      // If navigation failed, default to Notifications screen
      if (!navigationSuccessful) {
        console.log('⚠️ Falling back to Notifications screen');
        navigationRef.navigate('Notifications');
      }
    } catch (error) {
      console.error('❌ Global error in notification handler:', error);
      navigationRef.navigate('Notifications');
    }
  });
};

// Add notification received listener for debugging
export const addNotificationReceivedListener = () => {
  return Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data;
    console.log('📬 New notification received:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: JSON.stringify(data, null, 2),
      type: data?.type,
      reference_id: data?.reference_id,
      image_url: data?.image_url,
      reference_url: data?.reference_url
    });
  });
};
