import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import BlogPostDetail from '../screens/BlogPostDetail';
import NotificationsScreen from '../screens/NotificationsScreen';
import BlogPostsScreen from '../screens/BlogPostsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { RootStackParamList } from '../types';
import { NotificationButton } from '../components/NotificationButton';
import AboutUsScreen from '../screens/AboutUsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import CommunityScreen from '../screens/CommunityScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'HomeStack':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'BlogPosts':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'square';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => <NotificationButton />,
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackScreen}
        options={{ 
          title: 'Home',
          headerTitle: 'Dubai Debremewi'
        }}
      />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen 
        name="BlogPosts" 
        component={BlogPostsScreen}
        options={{ title: 'Blog' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="More" 
        component={MoreStackScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'menu' : 'menu-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Separate stack for Home to handle nested navigation
function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="BlogPostDetail" component={BlogPostDetail} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

const MoreStack = createStackNavigator();

function MoreStackScreen() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen} 
        options={{ title: 'More' }}
      />
      <MoreStack.Screen name="About Us" component={AboutUsScreen} />
      <MoreStack.Screen name="Services" component={ServicesScreen} />
      <MoreStack.Screen name="Contact Us" component={ContactUsScreen} />
      <MoreStack.Screen 
        name="Location" 
        component={CommunityScreen}
      />
    </MoreStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOnboardingComplete } = useSelector((state: RootState) => state.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : !isOnboardingComplete ? (
        // Onboarding Stack
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // Main App Stack with Bottom Tabs
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
