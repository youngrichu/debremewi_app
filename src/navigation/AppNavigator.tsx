import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import NotificationButton from '../components/NotificationButton';
import AboutUsScreen from '../screens/AboutUsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import CommunityScreen from '../screens/CommunityScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import { LanguageSelector } from '../components/LanguageSelector';
import YouTubeFeedScreen from '../screens/YouTubeFeedScreen';
import { IS_TABLET, getFontSize } from '../utils/responsive';

const Stack = createStackNavigator<RootStackParamList>();
const EventStack = createStackNavigator<RootStackParamList>();
const BlogStack = createStackNavigator<RootStackParamList>();
const AnnouncementStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();
const MoreStack = createStackNavigator();

// Add EventStack navigator
function EventStackScreen() {
  const { t } = useTranslation();

  return (
    <EventStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
      }}
    >
      <EventStack.Screen
        name="EventsList"
        component={EventsScreen}
        options={{
          headerShown: false
        }}
      />
      <EventStack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.eventDetails')
        }}
      />
    </EventStack.Navigator>
  );
}

function BlogStackScreen() {
  const { t } = useTranslation();

  return (
    <BlogStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
      }}
    >
      <BlogStack.Screen
        name="BlogList"
        component={BlogPostsScreen}
        options={{
          headerShown: false
        }}
      />
      <BlogStack.Screen
        name="BlogPostDetail"
        component={BlogPostDetail}
        options={{
          headerShown: true,
          title: t('navigation.screens.blogPostDetail')
        }}
      />
    </BlogStack.Navigator>
  );
}

function AnnouncementStackScreen() {
  const { t } = useTranslation();

  return (
    <AnnouncementStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
      }}
    >
      <AnnouncementStack.Screen
        name="AnnouncementsList"
        component={CommunityScreen}
        options={{
          headerShown: false
        }}
      />
      <AnnouncementStack.Screen
        name="AnnouncementDetail"
        component={CommunityScreen}
        options={{
          headerShown: true,
          title: t('navigation.screens.announcementDetail')
        }}
      />
    </AnnouncementStack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('Initializing notifications in MainTabs...');
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('Got push token:', token);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();
  }, []);

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
            case 'YouTube':
              iconName = focused ? 'logo-youtube' : 'logo-youtube';
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

          return <Ionicons name={iconName as any} size={IS_TABLET ? 32 : size} color={color} />;
        },
        tabBarActiveTintColor: '#2473E0',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LanguageSelector />
            <NotificationButton />
          </View>
        ),
        headerRightContainerStyle: { paddingRight: IS_TABLET ? 20 : 15 },
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
        tabBarStyle: {
          height: (IS_TABLET ? 90 : 60) + insets.bottom,
          paddingBottom: insets.bottom + (IS_TABLET ? 10 : 5),
          paddingTop: IS_TABLET ? 10 : 5,
        },
        tabBarLabelStyle: {
          fontSize: IS_TABLET ? 14 : 10,
          marginBottom: IS_TABLET ? 5 : 0,
        },
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
        name="YouTube"
        component={YouTubeFeedScreen}
        options={{
          title: t('navigation.tabs.youtube')
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
          title: t('navigation.tabs.more')
        }}
      />
    </Tab.Navigator>
  );
}

// Separate stack for Home to handle nested navigation
function HomeStackScreen() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
          title: t('navigation.screens.editProfile')
        }}
      />
    </Stack.Navigator>
  );
}

function MoreStackScreen() {
  const { t } = useTranslation();

  return (
    <MoreStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          marginLeft: IS_TABLET ? 20 : 16,
          fontSize: getFontSize(18),
        },
      }}
    >
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{
          headerShown: false  // Hide the header for the main More menu screen
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

export default function AppNavigator() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { userData } = useSelector((state: RootState) => state.user);

  // Debug logging
  console.log('Auth state:', { isAuthenticated });
  console.log('User data:', userData);

  const isOnboardingComplete = userData?.isOnboardingComplete ?? userData?.is_onboarding_complete ?? false;

  // Load user registration date from AsyncStorage on app start
  useEffect(() => {
    const loadRegistrationDate = async () => {
      try {
        const registrationDate = await AsyncStorage.getItem('userRegistrationDate');
        if (registrationDate) {
          console.log('Loaded registration date from storage:', registrationDate);
          const { setRegistrationDate } = require('../store/slices/userSlice');
          const { store } = require('../store');
          store.dispatch(setRegistrationDate(registrationDate));
        }
      } catch (error) {
        console.error('Error loading registration date:', error);
      }
    };

    if (isAuthenticated) {
      loadRegistrationDate();
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
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
                headerRightContainerStyle: { paddingRight: IS_TABLET ? 20 : 15 },
                headerTitleAlign: 'left',
                headerTitleStyle: {
                  marginLeft: IS_TABLET ? 20 : 16,
                  fontSize: getFontSize(18),
                },
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: true,
                title: t('navigation.screens.register'),
                headerRight: () => <LanguageSelector />,
                headerRightContainerStyle: { paddingRight: IS_TABLET ? 20 : 15 },
                headerTitleAlign: 'left',
                headerTitleStyle: {
                  marginLeft: IS_TABLET ? 20 : 16,
                  fontSize: getFontSize(18),
                },
              }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                headerShown: true,
                title: t('navigation.screens.forgotPassword'),
                headerRight: () => <LanguageSelector />,
                headerRightContainerStyle: { paddingRight: IS_TABLET ? 20 : 15 },
                headerTitleAlign: 'left',
                headerTitleStyle: {
                  marginLeft: IS_TABLET ? 20 : 16,
                  fontSize: getFontSize(18),
                },
              }}
            />
          </>
        ) : (
          // App Stack
          <>
            {!userData?.isOnboardingComplete ? (
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
              <Stack.Screen name="MainTabs" component={MainTabs} />
            )}
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: t('navigation.screens.notifications'),
                headerRight: () => <LanguageSelector />,
                headerRightContainerStyle: { paddingRight: IS_TABLET ? 20 : 15 },
                headerTitleAlign: 'left',
                headerTitleStyle: {
                  marginLeft: IS_TABLET ? 20 : 16,
                  fontSize: getFontSize(18),
                },
              }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{
                headerShown: true,
                title: t('navigation.screens.eventDetails'),
                headerRight: () => <LanguageSelector />,
                headerRightContainerStyle: { paddingRight: 15 },
              }}
            />
            <Stack.Screen
              name="BlogPostDetail"
              component={BlogPostDetail}
              options={{
                headerShown: true,
                title: t('navigation.screens.blogPostDetail'),
                headerRight: () => <LanguageSelector />,
                headerRightContainerStyle: { paddingRight: 15 },
              }}
            />
            <Stack.Screen
              name="AnnouncementDetail"
              component={CommunityScreen}
              options={{
                headerShown: true,
                title: t('navigation.screens.announcementDetail'),
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
    </>
  );
}
