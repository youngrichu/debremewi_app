import { StackNavigationProp } from '@react-navigation/stack';

export interface User {
  id: number;
  email: string;
  username: string;
  isOnboardingComplete?: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  // Add other post properties as needed
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Notifications: undefined;
  NewPassword: { token: string; email: string };
  Home: undefined;
  HomeStack: {
    screen: string;
    params?: {
      eventId?: string;
      postId?: string;
    };
  };
  EventDetails: { eventId: string };
  BlogPostDetail: { postId: string };
  EditProfile: undefined;
  EventsList: undefined;
  BlogPostsList: undefined;
  MoreMenu: undefined;
  'About Us': undefined;
  Services: undefined;
  'Contact Us': undefined;
  Location: undefined;
  BlogPosts: undefined;
  Events: undefined;
  Profile: undefined;
  More: undefined;
  EventStack: {
    screen: string;
    params?: {
      eventId?: string;
    };
  };
  BlogStack: {
    screen: string;
    params?: {
      postId?: string;
    };
  };
};

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  christianName: string;
  residencyCity: string;
  isOnboardingComplete: boolean;
  maritalStatus: string;
  hasChildren: string;
  numberOfChildren: string;
  christianLife: string;
  serviceAtParish: string;
  ministryService: string;
  hasFatherConfessor: string;
  fatherConfessorName: string;
  hasAssociationMembership: string;
  associationName: string;
  profilePhoto: string;
  profilePhotoUrl: string;
  residenceAddress: string;
  educationLevel: string;
  occupation: string;
  emergencyContact: string;
  residencePermit: string;
}

export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
