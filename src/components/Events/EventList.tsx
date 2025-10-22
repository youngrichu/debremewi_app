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
  onEventPress: (event: Event) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  labels: {
    noEvents: string;
    loading: string;
    error: string;
    retry: string;
  };
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventPress,
  onRefresh,
  onLoadMore,
  loading,
  loadingMore,
  hasMore,
  labels
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>{labels.loading}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{labels.noEvents}</Text>
      </View>
    );
  }

  // Sort events by date in descending order (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderItem = ({ item }: { item: Event }) => (
    <EventCard event={item} onPress={() => onEventPress(item)} />
  );

  const handleEndReached = () => {
    if (!loading && !loadingMore && hasMore) {
      onLoadMore();
    }
  };

  return (
    <FlatList
      data={sortedEvents}
      renderItem={renderItem}
      keyExtractor={(item, index) => 
        (item as any).is_occurrence && (item as any).occurrence_parent_id 
          ? `${(item as any).occurrence_parent_id}-${item.id}-${index}` 
          : `${item.id}-${index}`
      }
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? (
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
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});