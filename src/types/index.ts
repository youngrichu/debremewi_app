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

// API Response Types
interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  events?: T;
  message?: string;
}

// Event Types
export interface Event {
  id: number;
  title: string;
  date: string;
  end_date?: string;
  location?: string;
  description: string;
  thumbnail?: string;
  permalink?: string;
  categories?: string[];
  content?: string;
}

// Event Category Type
export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

// Events Response Type
export interface EventsResponse {
  events?: Event[];
  success?: boolean;
  message?: string;
}

// Event Detail Response Type
export interface EventDetailResponse {
  event?: Event;
  success?: boolean;
  message?: string;
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

export interface ChildInfo {
  fullName: string;
  christianityName: string;
  gender: string;
  age: string;
}

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
  hasChildren: string;
  numberOfChildren?: string;
  children?: ChildInfo[];
}

export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export interface OnboardingData {
  firstName: string;
  lastName: string;
  christianName?: string;
  // ... other fields ...
  children?: ChildInfo[];
}
