import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../store/notificationsSlice';
import { RootState } from '../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const NotificationButton: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { unreadCount, loading, error } = useSelector((state: RootState) => state.notifications);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      dispatch(fetchNotifications());

      // Set up periodic refresh
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  // Don't show anything if there's an error (notifications might not be enabled)
  if (error) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#2196F3" />
      ) : (
        <>
          <Ionicons 
            name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
            size={24} 
            color={unreadCount > 0 ? "#2196F3" : "#333"} 
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 