import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
import NewPasswordScreen from '../screens/NewPasswordScreen';
import { LanguageSelector } from '../components/LanguageSelector';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Add EventStack navigator
function EventStackScreen() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="EventsList" 
        component={EventsScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.eventDetails')
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();

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
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LanguageSelector />
            <NotificationButton />
          </View>
        ),
        headerRightContainerStyle: { paddingRight: 15 },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackScreen}
        options={{ 
          title: t('navigation.tabs.home'),
          headerTitle: t('navigation.appName')
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventStackScreen}
        options={{ 
          title: t('navigation.tabs.events')
        }}
      />
      <Tab.Screen 
        name="BlogPosts" 
        component={BlogStackScreen}
        options={{ 
          title: t('navigation.tabs.blog')
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: t('navigation.tabs.profile')
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStackScreen}
        options={{
          title: t('navigation.tabs.more'),
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
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.eventDetails')
        }}
      />
      <Stack.Screen 
        name="BlogPostDetail" 
        component={BlogPostDetail}
        options={{
          headerShown: true,
          title: t('navigation.screens.blogPostDetail')
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.editProfile'),
          headerRight: () => <LanguageSelector />,
          headerRightContainerStyle: { paddingRight: 15 },
        }}
      />
    </Stack.Navigator>
  );
}

const MoreStack = createStackNavigator();

function MoreStackScreen() {
  const { t } = useTranslation();

  return (
    <MoreStack.Navigator>
      <MoreStack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen} 
        options={{ 
          title: t('more.menu.title')  // "More" in English, "ተጨማሪ" in Amharic
        }}
      />
      <MoreStack.Screen 
        name="About Us" 
        component={AboutUsScreen} 
        options={{ 
          title: t('more.menu.aboutUs')  // "About Us" in English, "ስለ እኛ" in Amharic
        }}
      />
      <MoreStack.Screen 
        name="Services" 
        component={ServicesScreen} 
        options={{ 
          title: t('more.menu.services')  // "Services" in English, "አገልግሎቶች" in Amharic
        }}
      />
      <MoreStack.Screen 
        name="Contact Us" 
        component={ContactUsScreen} 
        options={{ 
          title: t('more.menu.contactUs')  // "Contact Us" in English, "አግኙን" in Amharic
        }}
      />
      <MoreStack.Screen 
        name="Location" 
        component={CommunityScreen}
        options={{ 
          title: t('more.menu.location')  // "Location" in English, "አድራሻ" in Amharic
        }}
      />
    </MoreStack.Navigator>
  );
}

// Add a new stack navigator for Blog
function BlogStackScreen() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BlogPostsList" 
        component={BlogPostsScreen}
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="BlogPostDetail" 
        component={BlogPostDetail}
        options={{
          headerShown: true,
          title: t('navigation.screens.blogPostDetail')
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOnboardingComplete } = useSelector((state: RootState) => state.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerShown: true,
              title: t('navigation.screens.login'),
              headerRight: () => <LanguageSelector />,
              headerRightContainerStyle: { paddingRight: 15 },
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              headerShown: true,
              title: t('navigation.screens.register'),
              headerRight: () => <LanguageSelector />,
              headerRightContainerStyle: { paddingRight: 15 },
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              headerShown: true,
              title: t('navigation.screens.forgotPassword'),
              headerRight: () => <LanguageSelector />,
              headerRightContainerStyle: { paddingRight: 15 },
            }}
          />
        </>
      ) : !isOnboardingComplete ? (
        // Onboarding Stack
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            headerShown: true,
            title: t('navigation.screens.onboarding'),
            headerRight: () => <LanguageSelector />,
            headerRightContainerStyle: { paddingRight: 15 },
          }}
        />
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: t('navigation.screens.notifications'),
              headerRight: () => <LanguageSelector />,
              headerRightContainerStyle: { paddingRight: 15 },
            }}
          />
        </>
      )}
      <Stack.Screen 
        name="NewPassword" 
        component={NewPasswordScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.newPassword'),
          headerRight: () => <LanguageSelector />,
          headerRightContainerStyle: { paddingRight: 15 },
        }}
      />
    </Stack.Navigator>
  );
}
