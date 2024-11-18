import apiClient from '../api/client';
import { format } from 'date-fns';

export interface Event {
  id: string;
  title: string;
  date: string;
  end_date: string;
  location: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  permalink?: string;
  categories?: string[];
}

export const getUpcomingEvents = async (): Promise<Event[]> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const response = await apiClient.get(
      `/wp-json/church-events/v1/events`, {
        params: {
          date_from: today,
          per_page: 10,
          orderby: 'date',
          order: 'ASC'
        }
      }
    );

    console.log('Events response:', response.data);

    if (response.data?.events && Array.isArray(response.data.events)) {
      return response.data.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        end_date: event.end_date,
        location: event.location || 'TBD',
        description: event.content || event.description,
        thumbnail: event.thumbnail,
        permalink: event.permalink,
        categories: event.categories
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}; 