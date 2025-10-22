import { Event } from '../types';

/**
 * Get the appropriate badge text for recurring events based on the recurring pattern
 * @param event - The event object
 * @param t - Translation function
 * @returns The translated badge text or empty string if not recurring
 */
export const getRecurringBadgeText = (event: Event, t: (key: string) => string): string => {
  // Show badge if it's an occurrence or a recurring event
  if (!event.is_occurrence && !event.is_recurring) return '';
  
  // Return specific pattern text based on recurring_pattern
  switch (event.recurring_pattern) {
    case 'daily':
      return t('events.daily');
    case 'weekly':
      return t('events.weekly');
    case 'monthly':
      return t('events.monthly');
    default:
      // Fallback to generic "Recurring" if pattern is not recognized
      return t('events.recurring');
  }
};

/**
 * Check if an event should show a recurring badge
 * @param event - The event object
 * @returns True if the event should show a recurring badge
 */
export const shouldShowRecurringBadge = (event: Event): boolean => {
  return (event.is_occurrence === true || event.is_occurrence === 1) || 
         (event.is_recurring === true || event.is_recurring === 1);
};