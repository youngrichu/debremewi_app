export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
  // Add other post properties
}

export interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location: string;
  // Add other event properties
}

export interface Livestream {
  id: number;
  title: string;
  url: string;
  status: 'live' | 'scheduled' | 'ended';
  // Add other livestream properties
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface WordPressService {
  getPosts(): Promise<Post[]>;
  getEvents(): Promise<Event[]>;
  getLivestreams(): Promise<Livestream[]>;
  // Add other API methods
}
