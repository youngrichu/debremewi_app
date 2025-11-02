import axios from 'axios';
import apiClient from '../api/client';
import { Event } from '../types';
import { AuthService } from './AuthService';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

export const getUpcomingEvents = async (): Promise<Event[]> => {
  let attempt = 1;
  let delay = INITIAL_DELAY;

  while (attempt <= MAX_RETRIES) {
    try {
      const response = await apiClient.get('/wp-json/church-events/v1/events?expand=occurrences');
      
      if (__DEV__) {
        console.log('EventsService.getUpcomingEvents - Raw API response:', response.data);
      }

      let events: Event[] = [];
      if (response.data?.events && Array.isArray(response.data.events)) {
        events = response.data.events;
      } else if (Array.isArray(response.data)) {
        events = response.data;
      } else {
        throw new Error('Unexpected response format from events API');
      }



      // Get current time in Dubai timezone (UTC+4)
      const now = new Date();
      const dubaiOffset = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
      const dubaiTime = new Date(now.getTime() + dubaiOffset);

      if (__DEV__) {
        console.log('Current time:', {
          local: now.toISOString(),
          dubai: dubaiTime.toISOString()
        });
      }

      // Filter and sort events
      const validEvents = events.filter(event => {
        try {
          // Parse dates and convert to Dubai time
          const eventStartTime = new Date(event.date.replace(' ', 'T'));
          const startInDubai = new Date(eventStartTime.getTime() + dubaiOffset);

          // Parse end date if it exists
          let endInDubai = null;
          if (event.end_date) {
            const eventEndTime = new Date(event.end_date.replace(' ', 'T'));
            
            // Check if times are in AM/PM format
            const startIsPM = event.date.toLowerCase().includes('pm');
            const endIsPM = event.end_date.toLowerCase().includes('pm');
            const startHour = eventStartTime.getHours();
            const endHour = eventEndTime.getHours();

            // Adjust for PM if needed (12 PM should not be adjusted)
            if (startIsPM && startHour !== 12) {
              eventStartTime.setHours(startHour + 12);
            }
            if (endIsPM && endHour !== 12) {
              eventEndTime.setHours(endHour + 12);
            }

            // If end time is still before start time, assume it's meant to be the next day
            if (eventEndTime < eventStartTime) {
              eventEndTime.setDate(eventEndTime.getDate() + 1);
            }

            endInDubai = new Date(eventEndTime.getTime() + dubaiOffset);
          }

          if (__DEV__) {
            console.log(`Event "${event.title}":`, {
              start: startInDubai.toISOString(),
              end: endInDubai?.toISOString(),
              now: dubaiTime.toISOString()
            });
          }

          // Event is valid if either:
          // 1. It has an end date and that end date is in the future, or
          // 2. It has no end date and the start date is in the future
          return endInDubai ? endInDubai >= dubaiTime : startInDubai >= dubaiTime;

        } catch (error) {
          console.warn(`Invalid date for event "${event.title}":`, error);
          return false;
        }
      });

      // Sort by start date in ascending order (earliest first)
      return validEvents.sort((a, b) => {
        const dateA = new Date(a.date.replace(' ', 'T'));
        const dateB = new Date(b.date.replace(' ', 'T'));
        const dubaiA = new Date(dateA.getTime() + dubaiOffset);
        const dubaiB = new Date(dateB.getTime() + dubaiOffset);
        return dubaiA.getTime() - dubaiB.getTime();
      });

    } catch (error) {
      console.error(`Events API error (attempt ${attempt}/${MAX_RETRIES}):`, error);

      if (error instanceof Error) {
        // Check for authentication errors
        if (error.message === 'Session expired. Please login again.' ||
            error.message === 'No authentication token found') {
          console.error('Authentication error:', error.message);
          throw new Error('Authentication failed. Please login again.');
        }

        // For network errors, retry
        if (axios.isAxiosError(error) && !error.response) {
          if (attempt === MAX_RETRIES) {
            console.error('Final events error:', error);
            throw error;
          }
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
      attempt++;
    }
  }

  throw new Error('Failed to fetch events after maximum retries');
};