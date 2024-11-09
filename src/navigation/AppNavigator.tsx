import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import BlogPostDetail from '../screens/BlogPostDetail';
import NotificationsScreen from '../screens/NotificationsScreen';
import { RootStackParamList } from '../types';
import { NotificationService } from '../services/NotificationService';
import { useRoute, useNavigationState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Stack = createStackNavigator<RootStackParamList>();

// Add type for notification
interface Notification {
  is_read: string;
}

// Add error type
interface ApiError {
  message: string;
  response?: {
    status: number;
  };
}

export default function AppNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add function to fetch notifications count
  const fetchNotificationsCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        NotificationService.setAuthToken(token);
        const notifications = await NotificationService.getNotifications();
        const unread = notifications.filter((n: Notification) => n.is_read === '0').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications count:', error);
    }
  };

  // Check auth status and fetch notifications
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Retrieved token:', token ? 'exists' : 'none');
      
      if (!token) {
        setIsAuthenticated(false);
        setUnreadCount(0);
        return;
      }

      NotificationService.setAuthToken(token);
      setIsAuthenticated(true);
      
      // Fetch notifications count after setting auth
      await fetchNotificationsCount();
      
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const renderNotificationIcon = ({ navigation }: { navigation: any }) => {
    if (!isAuthenticated) return null;

    const handleNotificationPress = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('Token when pressing notification:', token ? 'exists' : 'none');
        
        if (!token) {
          navigation.navigate('Login');
          return;
        }

        NotificationService.setAuthToken(token);
        navigation.navigate('Notifications');
        
      } catch (error) {
        console.error('Error handling notification press:', error);
      }
    };

    return (
      <TouchableOpacity 
        onPress={handleNotificationPress}
        style={{ marginRight: 15 }}
      >
        <View>
          <Ionicons name="notifications-outline" size={24} color="black" />
          {isAuthenticated && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
        listeners={{
          beforeRemove: () => {
            // Fetch notifications when leaving login screen (successful login)
            fetchNotificationsCount();
          },
        }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={({ navigation }) => ({
          headerRight: () => renderNotificationIcon({ navigation }),
        })}
        listeners={{
          focus: () => {
            // Fetch notifications when returning to Home screen
            fetchNotificationsCount();
          },
        }}
      />
      <Stack.Screen 
        name="BlogPostDetail" 
        component={BlogPostDetail}
        options={({ navigation }) => ({
          title: 'Blog Post',
          headerBackTitle: 'Back',
          headerTitleAlign: 'center',
          headerRight: () => renderNotificationIcon({ navigation }),
        })}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerTitleAlign: 'center',
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            fetchNotificationsCount();
          },
          beforeRemove: () => {
            // Update count when leaving notifications screen
            fetchNotificationsCount();
          },
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
