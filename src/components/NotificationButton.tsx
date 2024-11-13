import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setUnreadCount, setLoading, setError } from '../store/notificationsSlice';

export const NotificationButton = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Safely access notifications state with default values
  const unreadCount = notifications?.unreadCount ?? 0;
  const loading = notifications?.loading ?? false;
  const error = notifications?.error ?? null;

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize notifications state
      dispatch(setUnreadCount(0));
      dispatch(setLoading(false));
      dispatch(setError(null));
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated || error) {
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
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 