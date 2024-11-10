import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import BlogPostDetail from '../screens/BlogPostDetail';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import BlogPostsScreen from '../screens/BlogPostsScreen';
import { RootStackParamList } from '../types';
import { NotificationButton } from '../components/NotificationButton';
import { RootState } from '../store';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      screenOptions={{
        headerRight: () => isAuthenticated ? <NotificationButton /> : null,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerRight: () => null,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              headerRight: () => null,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              headerRight: () => null,
            }}
          />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="BlogPosts" component={BlogPostsScreen} />
          <Stack.Screen name="BlogPostDetail" component={BlogPostDetail} />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              headerRight: () => null,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
