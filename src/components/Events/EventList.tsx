import React from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Event } from '../../types';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
  onEventPress: (eventId: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventPress,
  onRefresh,
  loading,
}) => {
  // Sort events by date in descending order (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderItem = ({ item }: { item: Event }) => (
    <EventCard event={item} onPress={() => onEventPress(item.id)} />
  );

  return (
    <FlatList
      data={sortedEvents}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
}); 