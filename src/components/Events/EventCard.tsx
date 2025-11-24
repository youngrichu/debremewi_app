import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { toEthiopian, getEthiopianMonthName, formatEthiopianDate } from '../../utils/ethiopianCalendar';
import { getRecurringBadgeText, shouldShowRecurringBadge } from '../../utils/eventUtils';
import { IS_TABLET, getFontSize, scale } from '../../utils/responsive';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = React.memo(({ event, onPress }) => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';



  const formatDate = (date: string) => {
    if (isAmharic) {
      return formatEthiopianDate(new Date(date));
    }
    return format(new Date(date), 'PPP');
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'p');
  };

  return (
    <TouchableOpacity style={[styles.container, IS_TABLET && styles.tabletContainer]} onPress={onPress}>
      {event.thumbnail && (
        <Image
          source={{ uri: event.thumbnail }}
          style={[styles.image, IS_TABLET && styles.tabletImage]}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{event.title}</Text>
          {shouldShowRecurringBadge(event) && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat" size={scale(12)} color="#fff" />
              <Text style={styles.recurringBadgeText}>
                {getRecurringBadgeText(event, t)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={scale(16)} color="#666" />
            <Text style={styles.metaText}>
              {formatDate(event.date)}
            </Text>
          </View>

          <View style={styles.eventMeta}>
            <Ionicons name="time" size={scale(16)} color="#666" />
            <Text style={styles.metaText}>
              {format(new Date(event.date), 'h:mm a')}
              {event.end_date && (
                <> - {format(new Date(event.end_date), 'h:mm a')}</>
              )}
            </Text>
          </View>

          {event.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={scale(16)} color="#666" />
              <Text style={styles.metaText} numberOfLines={1}>
                {isAmharic ? 'ቦታ፡ ' : 'Location: '}{event.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDC65D',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 12,
    gap: 2,
  },
  recurringBadgeText: {
    color: '#fff',
    fontSize: getFontSize(10),
    fontWeight: '600',
  },
  metaContainer: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#666',
    fontSize: getFontSize(14),
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Tablet Styles
  tabletContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '95%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  tabletImage: {
    width: '35%',
    height: '100%',
  },
});