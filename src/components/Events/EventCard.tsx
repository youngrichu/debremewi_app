import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
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
              {format(new Date(event.date), 'PPP')}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.metaText}>
              {format(new Date(event.date), 'p')}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaContainer: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
}); 