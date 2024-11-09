import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { NotificationService } from '../services/NotificationService';

interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: string;
  created_at: string;
  type: string;
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // First update the UI optimistically
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id ? { ...n, is_read: '1' } : n
        )
      );

      // Then handle the notification press
      await NotificationService.handleNotificationPress(notification, navigation);
      
      // Refresh the notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error handling notification press:', error);
      // Revert the optimistic update if there was an error
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id ? { ...n, is_read: '0' } : n
        )
      );
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.is_read === '0' && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={item => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  blogPostNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
}); 