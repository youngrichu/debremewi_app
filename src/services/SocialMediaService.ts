import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface SocialMediaPost {
  id: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
  type: 'video' | 'short' | 'live';
  content: {
    title: string;
    description: string;
    media_url: string;
    thumbnail_url: string;
    original_url: string;
    created_at: string;
    engagement: {
      likes: string;
      comments: string;
      shares: number;
    };
  };
  author: {
    name: string;
    avatar: string;
    profile_url: string;
  };
}

export interface LiveStream {
  id: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  status: 'live' | 'upcoming' | 'ended';
  start_time: string;
  viewer_count: number;
}

export interface FeedResponse {
  status: string;
  data: {
    items: SocialMediaPost[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
    };
  };
}

export interface LiveStreamResponse {
  status: string;
  data: LiveStream[];
}

class SocialMediaService {
  async getFeed(params: {
    platform?: string;
    type?: string;
    page?: number;
    per_page?: number;
    sort?: 'date' | 'popularity';
    order?: 'asc' | 'desc';
  }) {
    const token = await AsyncStorage.getItem('userToken');
    const queryParams = new URLSearchParams();
    
    // Add all params to query string
    if (params.platform) queryParams.append('platform', params.platform);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const response = await fetch(
      `${API_URL}/wp-json/social-feed/v1/feeds?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch social media feed');
    }

    const data = await response.json();
    return data;
  }

  async getLiveStreams(params: {
    platform?: string;
    status?: 'live' | 'upcoming' | 'ended';
    page?: number;
    per_page?: number;
  }) {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.get<LiveStreamResponse>(
      `${API_URL}/wp-json/social-feed/v1/streams`,
      {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );
    return response.data;
  }

  async checkLiveStreamNotification() {
    try {
      const response = await this.getLiveStreams({
        platform: 'youtube',
        status: 'live',
        page: 1,
        per_page: 1,
      });
      if (response && response.data && response.data.length > 0) {
        const liveStream = response.data[0];
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Live Stream is On!',
            body: 'A live stream is currently active. Tap to join!',
            data: { liveStreamID: liveStream.id },
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error checking live stream notification:', error);
    }
  }
}

export default new SocialMediaService(); 