import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventService } from '../services/EventService';
import { Event } from '../types';
import { format } from 'date-fns';
import * as Calendar from 'expo-calendar';
import { useNavigation } from '@react-navigation/native';

interface EventDetailsScreenProps {
  route: {
    params: {
      eventId: number;
    };
  };
}

export default function EventDetailsScreen({ route }: EventDetailsScreenProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const formatContent = (content: string): string => {
    return content
      // Remove WordPress comments and paragraph tags
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?p>/g, '')
      // Remove empty lines
      .replace(/^\s*[\r\n]/gm, '')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  };

  useEffect(() => {
    loadEvent();
  }, [route.params.eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading event with ID:', route.params.eventId);
      const eventData = await EventService.getEventById(route.params.eventId);
      console.log('Loaded event data:', eventData);
      
      if (eventData) {
        setEvent({
          ...eventData,
          content: formatContent(eventData.content)
        });
      } else {
        setError('Event not found');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (event) {
      try {
        await Share.share({
          message: `Check out this event: ${event.title}\n${event.permalink}`,
        });
      } catch (error) {
        console.error('Error sharing event:', error);
      }
    }
  };

  const handleAddToCalendar = async () => {
    if (!event) return;

    try {
      // First, request calendar permissions
      const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant calendar permissions to add events to your calendar.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get available calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.log('Available calendars:', calendars);

      // Find suitable calendar based on platform
      const defaultCalendar = Platform.select({
        ios: () => {
          // On iOS, prefer iCloud calendar if available, otherwise use the first writable calendar
          return calendars.find(cal => 
            cal.allowsModifications && 
            (cal.source.name === 'iCloud' || cal.source.name === 'Default')
          ) || calendars.find(cal => cal.allowsModifications);
        },
        android: () => {
          // On Android, prefer Google Calendar
          return calendars.find(cal => {
            return (
              cal.allowsModifications &&
              cal.source.type === 'com.google' &&
              cal.accessLevel === 'owner' &&
              cal.ownerAccount &&
              cal.ownerAccount.includes('@gmail.com')
            );
          });
        },
        default: () => calendars.find(cal => cal.allowsModifications),
      })();

      if (!defaultCalendar) {
        Alert.alert(
          'Calendar Not Found',
          Platform.OS === 'ios' 
            ? 'Could not find a writable calendar. Please check your calendar settings.'
            : 'Could not find your Google Calendar. Please make sure you have added your Google account to your device.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Selected calendar:', defaultCalendar);

      // Format dates properly
      const startDate = new Date(event.date);
      const endDate = new Date(event.end_date);

      // Create the event
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        startDate,
        endDate,
        location: event.location,
        notes: event.content,
        timeZone: defaultCalendar.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        alarms: [
          {
            relativeOffset: -60, // 1 hour before
            method: Calendar.AlarmMethod.ALERT,
          },
          {
            relativeOffset: -1440, // 1 day before
            method: Calendar.AlarmMethod.ALERT,
          }
        ],
        availability: Calendar.Availability.BUSY,
      });

      if (eventId) {
        Alert.alert(
          'Success',
          'Event has been added to your calendar',
          [
            { 
              text: 'OK',
              onPress: () => {
                // On iOS, open the Calendar app using the universal link
                if (Platform.OS === 'ios') {
                  Linking.openURL('calshow://');
                } else {
                  // On Android, use the content URI
                  Linking.openURL('content://com.android.calendar/time/');
                }
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to create event');
      }

    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert(
        'Error',
        'Failed to add event to calendar. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadEvent}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {event.thumbnail && (
        <Image
          source={{ uri: event.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.metaText}>
              {format(new Date(event.date), 'PPP')}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.metaText}>
              {format(new Date(event.date), 'p')} -{' '}
              {format(new Date(event.end_date), 'p')}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCalendar}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{event.content}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metaContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});
