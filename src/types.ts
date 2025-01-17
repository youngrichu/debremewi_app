export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

interface EventCategory {
  name: string;
  slug: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  end_date: string;
  location?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  permalink?: string;
  categories: EventCategory[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  HomeStack: {
    screen: string;
    params?: object;
  };
  Events: {
    screen?: string;
    params?: {
      eventId?: number;
    };
  };
  BlogPosts: undefined;
  BlogPostDetail: {
    post: Post;
  };
  More: {
    screen: string;
    params?: object;
  };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  NewPassword: { email: string };
  EventDetails: { eventId: number };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  'About Us': undefined;
  Services: undefined;
  'Contact Us': undefined;
  Location: undefined;
};

// Authentication Types
interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
} 