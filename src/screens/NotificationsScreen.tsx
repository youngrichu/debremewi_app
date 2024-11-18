import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../store/slices/notificationsSlice';
import { RootState, AppDispatch } from '../store';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleNotificationPress = async (notification: any) => {
    try {
      await markNotificationAsRead(notification.id);
      
      if (notification.type === 'event') {
        navigation.navigate('MainTabs', {
          screen: 'Events',
          params: {
            screen: 'EventDetails',
            params: { eventId: notification.reference_id }
          }
        });
      } else if (notification.type === 'blog') {
        navigation.navigate('MainTabs', {
          screen: 'BlogPosts',
          params: {
            screen: 'BlogPostDetail',
            params: { postId: notification.reference_id }
          }
        });
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              item.is_read === '0' && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.notificationContent}>
              <Text style={[
                styles.title,
                item.is_read === '0' && styles.unreadTitle
              ]}>
                {item.title}
              </Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>
                {format(new Date(item.created_at), 'dd/MM/yyyy')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
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
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#000',
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
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