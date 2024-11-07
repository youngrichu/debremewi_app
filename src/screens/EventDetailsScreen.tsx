import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EventDetailsScreen({ route }) {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <Text>Event Details</Text>
      <Text>{event.title}</Text>
      <Text>{event.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
