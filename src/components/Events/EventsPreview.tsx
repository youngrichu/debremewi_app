import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface EventsPreviewProps {
  events: Event[];
  onEventPress: (eventId: number) => void;
}

export const EventsPreview: React.FC<EventsPreviewProps> = ({
  events,
  onEventPress,
}) => {
  console.log('EventsPreview received events:', events);

  const safeEvents = Array.isArray(events) ? events : [];

  // Filter out events with invalid dates
  const validEvents = safeEvents.filter(event => 
    event?.id && event?.date && event?.title && new Date(event.date).toString() !== 'Invalid Date'
  );

  if (validEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No upcoming events</Text>
      </View>
    );
  }

  const previewEvents = validEvents.slice(0, 3);

  return (
    <View style={styles.container}>
      {previewEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.eventItem}
          onPress={() => onEventPress(event.id)}
        >
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>
              {format(new Date(event.date), 'd')}
            </Text>
            <Text style={styles.dateMonth}>
              {format(new Date(event.date), 'MMM')}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={styles.eventMeta}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.eventTime}>
                {format(new Date(event.date), 'h:mm a')}
              </Text>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.eventLocation} numberOfLines={1}>
                {event.location || 'No location specified'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    marginRight: 10,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dateMonth: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
}); 