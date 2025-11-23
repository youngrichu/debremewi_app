import React, { useEffect, useCallback, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchNotifications,
  selectUnreadCount,
  selectNotificationsLoading
} from '../store/slices/notificationsSlice';
import { IS_TABLET, getFontSize } from '../utils/responsive';

type RootStackParamList = {
  Notifications: undefined;
};

const NotificationButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const [opacity] = useState(new Animated.Value(1));

  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  console.log('NotificationButton render:', { unreadCount, loading });

  const fetchData = useCallback(async () => {
    try {
      // Only fade out if we're showing a badge
      if (unreadCount > 0) {
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      await dispatch(fetchNotifications());

      // Fade back in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [dispatch, unreadCount, opacity]);

  useEffect(() => {
    console.log('NotificationButton mounted, fetching data...');
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handlePress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={loading}
    >
      <Ionicons
        name={unreadCount > 0 ? "notifications" : "notifications-outline"}
        size={IS_TABLET ? 28 : 24}
        color={unreadCount > 0 ? "#2196F3" : "#333"}
      />
      {unreadCount > 0 && (
        <Animated.View style={[styles.badge, { opacity }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: IS_TABLET ? 10 : 8,
    marginRight: IS_TABLET ? 10 : 8,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF3B30',
    borderRadius: IS_TABLET ? 12 : 10,
    minWidth: IS_TABLET ? 24 : 20,
    height: IS_TABLET ? 24 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: IS_TABLET ? 5 : 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: getFontSize(12),
    fontWeight: 'bold',
  },
});

export default NotificationButton; 