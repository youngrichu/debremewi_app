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
      console.error('Error fetching event categories:', error);
      throw error;
    }
  }

  static async getEvents(params: {
    category?: string;
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Event[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiClient.get<EventsResponse>(`/wp-json/church-events/v1/events?${queryParams}`);
      
      console.log('API Response:', response.data);

      // Extract events array from the response
      if (response.data && Array.isArray(response.data.events)) {
        return response.data.events.map(event => ({
          ...event,
          id: parseInt(event.id as string, 10) // Convert string ID to number if needed
        }));
      }

      console.warn('No events found in response');
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  static async getEventById(id: number): Promise<Event | null> {
    try {
      // First try to find the event in the events list response
      const response = await apiClient.get<EventDetailResponse>(`/wp-json/church-events/v1/events/${id}`);
      console.log('Event detail response:', response.data);

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

      console.warn('Event not found in response:', response.data);
      return null;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  }
} 