import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { toEthiopian, getEthiopianMonthName, formatEthiopianDate } from '../../utils/ethiopianCalendar';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { i18n } = useTranslation();
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
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
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.metaText}>
              {formatDate(event.date)}
            </Text>
          </View>

          <View style={styles.eventMeta}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.metaText}>
              {format(new Date(event.date), 'h:mm a')}
              {event.end_date && (
                <> - {format(new Date(event.end_date), 'h:mm a')}</>
              )}
            </Text>
          </View>

          {event.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.metaText} numberOfLines={1}>
                {isAmharic ? 'ቦታ፡ ' : 'Location: '}{event.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
    fontSize: 14,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 