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
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';
import { EventDetailsShimmer } from '../components/EventDetailsShimmer';
import { getFontSize, IS_TABLET } from '../utils/responsive';

interface EventDetailsScreenProps {
  route: {
    params: {
      eventId: number;
      occurrenceDate?: string;
      isOccurrence?: boolean;
    };
  };
}

export default function EventDetailsScreen({ route }: EventDetailsScreenProps) {
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isAmharic = i18n.language === 'am';

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
  }, [route.params.eventId, route.params.occurrenceDate]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await EventService.getEventById(route.params.eventId);

      if (eventData) {
        // If this is an occurrence, override the date with the occurrence date
        const finalEventData = {
          ...eventData,
          content: eventData.content ? formatContent(eventData.content) : '',
          date: route.params.isOccurrence && route.params.occurrenceDate
            ? route.params.occurrenceDate
            : eventData.date
        };

        setEvent(finalEventData);
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
        // Use the permalink from the API if available, otherwise construct the URL
        const eventUrl = event.permalink || `https://dubaidebremewi.com/events/${event.id}`;

        const shareMessage = t('events.details.share.message', {
          title: event.title,
          date: format(new Date(event.date), 'PPP'),
          location: event.location,
        });

        await Share.share({
          message: `${shareMessage}\n\n${eventUrl}`,
          url: eventUrl, // This will be used on iOS when sharing to certain apps
          title: event.title, // This will be used as the subject on Android
        });
      } catch (error) {
        console.error('Error sharing event:', error);
      }
    }
  };

  const handleAddToCalendar = async () => {
    if (!event) return;

    try {
      const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          t('events.details.addToCalendar.permission.title'),
          t('events.details.addToCalendar.permission.message'),
          [{ text: t('common.ok') }]
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
          t('events.details.addToCalendar.permission.notFound.title'),
          Platform.OS === 'ios'
            ? t('events.details.addToCalendar.permission.notFound.ios')
            : t('events.details.addToCalendar.permission.notFound.android'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      console.log('Selected calendar:', defaultCalendar);

      // Format dates properly with validation
      const startDate = new Date(event.date);

      // Validate start date
      if (isNaN(startDate.getTime())) {
        throw new Error(`Invalid start date: ${event.date}`);
      }

      // Handle end date - if not provided or invalid, default to 1 hour after start
      let endDate: Date;
      if (event.end_date) {
        endDate = new Date(event.end_date);
        // If end_date is invalid, default to start + 1 hour
        if (isNaN(endDate.getTime())) {
          console.warn('Invalid end_date, using start date + 1 hour');
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }
      } else {
        // No end_date provided, default to start + 1 hour
        console.log('No end_date provided, using start date + 1 hour');
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }

      // Ensure end date is after start date
      if (endDate <= startDate) {
        console.warn('End date is before or equal to start date, adjusting to start + 1 hour');
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }

      console.log('Creating calendar event:', {
        title: event.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: event.location,
        calendarId: defaultCalendar.id,
        calendarName: defaultCalendar.title,
        timeZone: defaultCalendar.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Create the event with simplified alarm configuration to avoid sync errors
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        startDate,
        endDate,
        location: event.location || '',
        notes: event.content || '',
        timeZone: defaultCalendar.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        alarms: [
          {
            relativeOffset: -60, // 1 hour before
            method: Calendar.AlarmMethod.ALERT,
          }
        ],
        availability: Calendar.Availability.BUSY,
      });

      console.log('Calendar event created with ID:', eventId);

      if (eventId) {
        Alert.alert(
          t('common.success'),
          t('events.details.addToCalendar.success'),
          [
            {
              text: t('events.details.addToCalendar.viewCalendar'),
              onPress: async () => {
                try {
                  const url = Platform.OS === 'ios'
                    ? 'calshow://'
                    : 'content://com.android.calendar/time/';

                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    console.warn('Cannot open calendar URL:', url);
                  }
                } catch (err) {
                  console.error('Error opening calendar:', err);
                }
              }
            },
            {
              text: t('common.ok'),
              style: 'cancel'
            }
          ]
        );
      } else {
        throw new Error('Failed to create event - no event ID returned');
      }

    } catch (error: any) {
      console.error('Error adding to calendar:', error);

      // Provide more detailed error message
      let errorMessage = t('events.details.addToCalendar.error');
      if (error?.message) {
        errorMessage += `\n\nDetails: ${error.message}`;
      }

      Alert.alert(
        t('common.error'),
        errorMessage,
        [{ text: t('common.ok') }]
      );
    }
  };

  const formatDate = (date: string) => {
    if (isAmharic) {
      return formatEthiopianDate(new Date(date));
    }
    return format(new Date(date), 'PPP');
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'p');
  };

  const tagsStyles = {
    body: {
      fontSize: getFontSize(16),
      lineHeight: getFontSize(24),
      color: '#444',
    },
    p: {
      marginBottom: 16,
    },
    h1: {
      fontSize: getFontSize(24),
      fontWeight: 'bold' as const,
      marginVertical: 12,
      color: '#333',
    },
    h2: {
      fontSize: getFontSize(20),
      fontWeight: 'bold' as const,
      marginVertical: 10,
      color: '#333',
    },
    h3: {
      fontSize: getFontSize(18),
      fontWeight: 'bold' as const,
      marginVertical: 8,
      color: '#333',
    },
    a: {
      color: '#2196F3',
      textDecorationLine: 'underline' as const,
    },
    ul: {
      marginBottom: 16,
    },
    li: {
      marginBottom: 8,
    },
    img: {
      borderRadius: 8,
      marginVertical: 8,
    },
  };

  if (loading) {
    return <EventDetailsShimmer />;
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || t('events.details.error.notFound')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadEvent}
        >
          <Text style={styles.retryButtonText}>{t('events.details.error.retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('events.details.error.goBack')}</Text>
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
            <Ionicons name="calendar-outline" size={IS_TABLET ? 28 : 24} color="#666" />
            <Text style={styles.metaText}>
              {formatDate(event.date)}
            </Text>
          </View>

          <View style={styles.eventMetaItem}>
            <Ionicons name="time-outline" size={IS_TABLET ? 24 : 20} color="#666" />
            <Text style={styles.eventMetaText}>
              {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
              {'\n'}
              {format(new Date(event.date), 'h:mm a')}
              {event.end_date && (
                <> - {format(new Date(event.end_date), 'h:mm a')}</>
              )}
            </Text>
          </View>

          {event.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={IS_TABLET ? 28 : 24} color="#666" />
              <Text style={styles.metaText}>
                {isAmharic ? 'ቦታ፡ ' : 'Location: '}{event.location}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCalendar}
          >
            <Ionicons name="calendar" size={IS_TABLET ? 24 : 20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {t('events.details.addToCalendar.button')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share" size={IS_TABLET ? 24 : 20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {t('events.details.share.button')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>
            {t('events.details.description')}
          </Text>
          <RenderHTML
            contentWidth={width - 32}
            source={{
              html: event.content || ''
            }}
            tagsStyles={tagsStyles}
            renderersProps={{
              img: {
                enableExperimentalPercentWidth: true,
              },
            }}
            defaultTextProps={{
              selectable: true,
            }}
            baseStyle={{
              fontSize: getFontSize(16),
              lineHeight: getFontSize(24),
              color: '#444',
            }}
            systemFonts={[]}
          />
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
    height: IS_TABLET ? 400 : 250,
  },
  content: {
    padding: IS_TABLET ? 24 : 16,
  },
  title: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metaContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: IS_TABLET ? 16 : 12,
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
    fontSize: getFontSize(15),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: IS_TABLET ? 16 : 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: IS_TABLET ? 24 : 16,
    paddingVertical: IS_TABLET ? 14 : 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: getFontSize(15),
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: IS_TABLET ? 20 : 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventMetaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: getFontSize(15),
  },
});
