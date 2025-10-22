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
  event?: Event;
  id?: number | string;
  title?: string;
  date?: string;
  end_date?: string;
  location?: string;
  description?: string;
  thumbnail?: string;
  permalink?: string;
  categories?: string[];
  content?: string;
  is_occurrence?: boolean;
  occurrence_parent_id?: number;
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
    expand?: 'occurrences' | 'none';
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
        const processedEvents = response.data.events.map(event => ({
          ...event,
          id: typeof event.id === 'string' ? parseInt(event.id, 10) : event.id
        }));
        
        // Debug logging for recurring events
        console.log('EventService.getEvents - Raw API response events:', response.data.events.length);
        console.log('EventService.getEvents - Events with is_occurrence field:', 
          response.data.events.filter((e: any) => e.is_occurrence).map((e: any) => ({
            id: e.id,
            title: e.title,
            is_occurrence: e.is_occurrence,
            occurrence_parent_id: e.occurrence_parent_id
          }))
        );
        
        return {
          events: processedEvents,
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
      if (response.data && response.data.id && response.data.title && response.data.date) {
        return {
          id: typeof response.data.id === 'string' ? parseInt(response.data.id, 10) : response.data.id,
          title: response.data.title,
          date: response.data.date,
          description: response.data.content || response.data.description || '',
          end_date: response.data.end_date,
          location: response.data.location,
          thumbnail: response.data.thumbnail,
          permalink: response.data.permalink,
          categories: response.data.categories,
          content: response.data.content,
          is_occurrence: response.data.is_occurrence,
          occurrence_parent_id: response.data.occurrence_parent_id
        };
      }

      console.error('Event not found or invalid response structure:', response.data);
      throw new Error('Event not found');
    } catch (error) {
      console.error('Error in getEventById:', error);
      if (error instanceof Error && error.message === 'Event not found') {
        throw error;
      }
      throw new Error('Failed to fetch event details');
    }
  }
}