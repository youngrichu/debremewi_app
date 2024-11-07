import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents } from '../store/eventsSlice';
import { Event } from '../types';
import { LoadingIndicator } from '../components/common';

const EventsScreen = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state: RootState) => state.events);

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const renderItem = ({ item }: { item: Event }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text>{`${item.start.toLocaleString()} - ${item.end.toLocaleString()}`}</Text>
      <Text>{item.location}</Text>
    </View>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <Text>Error loading events: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventsScreen;
