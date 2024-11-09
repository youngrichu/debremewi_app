export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface Post {
  id: number;
  date?: string;
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
  title: string;
  body: string;
  is_read: string;
  created_at: string;
  type: string;
  user_id: string;
  reference_id?: string;
  reference_type?: string;
  excerpt?: string;
  featured_image?: {
    url: string;
    alt?: string;
  };
  blog_post?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featured_image?: {
      url: string;
      alt?: string;
    };
  };
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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  BlogPostDetail: { post: Post };
  Notifications: undefined;
};
