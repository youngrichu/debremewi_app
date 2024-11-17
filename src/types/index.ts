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
  HomeStack: undefined;
  EventStack: undefined;
  BlogStack: undefined;
};
