import React, { useEffect, useCallback, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchNotifications } from '../store/slices/notificationsSlice';

type RootStackParamList = {
  Notifications: undefined;
};

const NotificationButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const [opacity] = useState(new Animated.Value(1));
  
  const { unreadCount = 0, loading = false } = useSelector((state: RootState) => ({
    unreadCount: state.notifications?.unreadCount ?? 0,
    loading: state.notifications?.loading ?? false
  }));

  const fetchData = useCallback(async () => {
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
  }, [dispatch, unreadCount, opacity]);

  useEffect(() => {
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
        size={24} 
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

export default NotificationButton; 