import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../store/slices/notificationsSlice';
import { RootState, AppDispatch } from '../store';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { NotificationCard } from '../components/NotificationCard';
import { API_URL } from '../config';
import { Linking } from 'react-native';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const REFRESH_INTERVAL = 30000; // 30 seconds
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  
  // Remove duplicates based on reference_id and type
  const uniqueNotifications = notifications.filter((notification, index, self) =>
    index === self.findIndex((n) => (
      n.reference_id === notification.reference_id && 
      n.type === notification.type
    ))
  );

  const [localNotifications, setLocalNotifications] = useState(uniqueNotifications);

  useEffect(() => {
    setLocalNotifications(uniqueNotifications);
  }, [notifications]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const autoRefresh = async () => {
      if (!isAutoRefreshing) {
        setIsAutoRefreshing(true);
        try {
          const result = await dispatch(fetchNotifications()).unwrap();
          if (isMounted) {
            setLocalNotifications(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(result.notifications)) {
                return result.notifications;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        } finally {
          if (isMounted) {
            setIsAutoRefreshing(false);
          }
        }
      }
    };

    if (!localNotifications.length) {
      dispatch(fetchNotifications());
    }

    intervalId = setInterval(autoRefresh, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [dispatch]);

  const handleDeepLink = (url: string) => {
    try {
      const path = url.replace('dubaidebremewi://', '');
      const [screen, id] = path.split('/');
      
      switch (screen) {
        case 'events':
          navigation.navigate('MainTabs', {
            screen: 'Events',
            params: {
              screen: 'EventDetails',
              params: { eventId: id }
            }
          });
          break;
        case 'blog':
          navigation.navigate('MainTabs', {
            screen: 'BlogPosts',
            params: {
              screen: 'BlogPostDetail',
              params: { postId: id }
            }
          });
          break;
        case 'announcements':
          navigation.navigate('MainTabs', {
            screen: 'Announcements',
            params: {
              screen: 'AnnouncementDetail',
              params: { id }
            }
          });
          break;
        case 'watch':
          console.log('Opening YouTube video:', id);
          Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
          break;
        default:
          console.log('Unknown screen type:', screen);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    try {
      console.log('Notification pressed:', notification);
      
      // Mark as read first to prevent double-clicking
      await dispatch(markNotificationAsRead(notification.id)).unwrap();
      console.log('Notification marked as read:', notification.id);
      
      const navigateToContent = async () => {
        if (notification.type === 'event' && notification.reference_id) {
          console.log('Navigating to event:', notification.reference_id);
          navigation.navigate('EventDetails', { 
            eventId: notification.reference_id 
          });
          return true;
        }

        if (notification.type === 'blog_post' && notification.reference_id) {
          console.log('Navigating to blog post:', notification.reference_id);
          navigation.navigate('BlogPostDetail', { postId: notification.reference_id });
          return true;
        }

        if (notification.type === 'video') {
          console.log('Handling video notification:', {
            youtube_url: notification.youtube_url,
            reference_url: notification.reference_url
          });
          
          // First try youtube_url from notification_data
          if (notification.youtube_url) {
            console.log('Opening direct YouTube URL:', notification.youtube_url);
            await Linking.openURL(notification.youtube_url);
            return true;
          }
          
          // Then try reference_url for deep link
          if (notification.reference_url) {
            console.log('Handling video deep link:', notification.reference_url);
            handleDeepLink(notification.reference_url);
            return true;
          }
          
          // Finally try to construct URL from reference_id
          if (notification.reference_id) {
            console.log('Opening video using reference_id:', notification.reference_id);
            await Linking.openURL(`https://www.youtube.com/watch?v=${notification.reference_id}`);
            return true;
          }
          
          console.log('No valid video URL found');
          return false;
        }

        if (notification.reference_url) {
          console.log('Handling deep link:', notification.reference_url);
          handleDeepLink(notification.reference_url);
          return true;
        }

        console.log('No navigation path found');
        return false;
      };

      const navigationSuccessful = await navigateToContent();

      if (!navigationSuccessful) {
        console.log('Navigation not handled');
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!refreshing && !isAutoRefreshing) {
      setRefreshing(true);
      try {
        const result = await dispatch(fetchNotifications()).unwrap();
        setLocalNotifications(result.notifications);
      } finally {
        setRefreshing(false);
      }
    }
  }, [dispatch, refreshing, isAutoRefreshing]);

  if (loading && !localNotifications.length && !refreshing && !isAutoRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={localNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2196F3"]}
            tintColor="#2196F3"
            progressBackgroundColor="#ffffff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
        contentContainerStyle={!localNotifications.length ? { flex: 1 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});