import apiClient from '../api/client';
import { Event, EventCategory } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface EventsResponse {
  events: Event[];
  pages: number;
  total: number;
}

interface EventDetailResponse {
  event: Event;
}

export class EventService {
  static async getCategories(): Promise<EventCategory[]> {
    try {
      // Check cache first
      const cached = await AsyncStorage.getItem('eventCategories');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }

      const response = await apiClient.get('/wp-json/church-events/v1/categories');
      const categories = response.data;

      // Cache the results
      await AsyncStorage.setItem('eventCategories', JSON.stringify({
        data: categories,
        timestamp: Date.now()
      }));

      return categories;
    } catch (error) {
      throw new Error('Failed to fetch event categories');
    }
  }

  static async getEvents(params: {
    category?: string;
    page?: number;
    per_page?: number;
    orderby?: 'date' | 'title';
    order?: 'ASC' | 'DESC';
    start_date?: string;
    end_date?: string;
  }): Promise<{ events: Event[]; hasMore: boolean; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiClient.get<EventsResponse>(
        `/wp-json/church-events/v1/events?${queryParams}`
      );

      if (response.data && Array.isArray(response.data.events)) {
        return {
          events: response.data.events.map(event => ({
            ...event,
            id: parseInt(event.id as string, 10)
          })),
          hasMore: (params.page || 1) < response.data.pages,
          total: response.data.total
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      throw new Error('Failed to fetch events');
    }
  }

  static async getEventById(id: number): Promise<Event | null> {
    try {
      // First try to find the event in the events list response
      const response = await apiClient.get<EventDetailResponse>(`/wp-json/church-events/v1/events/${id}`);

      if (response.data && response.data.event) {
        return {
          ...response.data.event,
          id: typeof response.data.event.id === 'string' 
            ? parseInt(response.data.event.id, 10) 
            : response.data.event.id
        };
      }

      // If the event property doesn't exist, check if the response itself is the event
      if (response.data && response.data.id) {
        return {
          ...response.data,
          id: typeof response.data.id === 'string' 
            ? parseInt(response.data.id, 10) 
            : response.data.id
        };
      }

      throw new Error('Event not found');
    } catch (error) {
      throw new Error('Failed to fetch event details');
    }
  }
}