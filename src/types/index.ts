import { StackNavigationProp } from '@react-navigation/stack';

export interface User {
  id: number;
  email: string;
  username: string;
  is_onboarding_complete?: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  // Add other post properties as needed
}

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  NewPassword: { token: string; email: string };
  
  // Onboarding
  Onboarding: undefined;
  
  // Main Navigation
  MainTabs: {
    screen?: string;
    params?: {
      screen?: string;
      params?: {
        eventId?: string;
        postId?: string;
        id?: string;
      };
    };
  };
  
  // Tab Screens
  HomeStack: undefined;
  Events: undefined;
  BlogPosts: undefined;
  Announcements: undefined;
  Profile: undefined;
  More: undefined;
  
  // Event Stack
  EventsList: undefined;
  EventDetails: { eventId: string };
  
  // Blog Stack
  BlogList: undefined;
  BlogPostDetail: { postId: string };
  
  // Announcement Stack
  AnnouncementsList: undefined;
  AnnouncementDetail: { id: string };
  
  // Profile Related
  EditProfile: undefined;
  
  // More Menu
  MoreMenu: undefined;
  'About Us': undefined;
  Services: undefined;
  'Contact Us': undefined;
  Location: undefined;
  
  // Notifications
  Notifications: undefined;
};

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  christianName: string;
  gender: string;
  maritalStatus: string;
  educationLevel: string;
  occupation: string;
  phoneNumber: string;
  residencyCity: string;
  residenceAddress: string;
  emergencyContact: string;
  christianLife: string;
  serviceAtParish: string;
  ministryService: string;
  hasFatherConfessor: string;
  fatherConfessorName: string;
  hasAssociationMembership: string;
  residencePermit: string;
  profilePhotoUrl?: string;
  avatar_url?: string;
  photo?: string;
  isOnboardingComplete?: boolean;
  is_onboarding_complete?: boolean;
}

export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
