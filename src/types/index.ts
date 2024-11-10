export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface Post {
  id: number;
  date?: string;
  link?: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media?: string;
  _embedded?: {
    author?: Array<{
      name: string;
      avatar_urls?: {
        [key: string]: string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: string;
  created_at: string;
  reference_id: string | null;
  reference_type: string | null;
  reference_url: string | null;
  image_url: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: {
    url: string;
    alt?: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  slug: string;
}

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface Event {
  id: number;
  title: string;
  content: string;
  date: string;
  end_date: string;
  location: string;
  permalink: string;
  thumbnail?: string;
  categories: EventCategory[];
}

export interface EventsState {
  events: Event[];
  categories: EventCategory[];
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  selectedCategory: string | null;
  viewMode: 'month' | 'week' | 'day';
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  BlogPostDetail: { post: Post };
  Notifications: undefined;
  Events: undefined;
  EventDetails: { eventId: number };
  EventCalendar: undefined;
  BlogPosts: undefined;
};
