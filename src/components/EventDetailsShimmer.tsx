import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const ShimmerComponent = ShimmerPlaceholder as any;

export const EventDetailsShimmer = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Event Image Shimmer */}
      <ShimmerComponent
        LinearGradient={LinearGradient}
        style={styles.eventImage}
      />

      {/* Event Header */}
      <View style={styles.header}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.title}
        />
        <View style={styles.dateTimeContainer}>
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.dateTime}
          />
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.dateTime}
          />
        </View>
      </View>

      {/* Event Location */}
      <View style={styles.section}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.location}
        />
      </View>

      {/* Event Description */}
      <View style={styles.section}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        {[1, 2, 3, 4].map((_, index) => (
          <ShimmerComponent
            key={index}
            LinearGradient={LinearGradient}
            style={styles.descriptionLine}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.actionButton}
        />
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  header: {
    padding: 16,
  },
  title: {
    width: '90%',
    height: 28,
    borderRadius: 4,
    marginBottom: 16,
  },
  dateTimeContainer: {
    gap: 8,
  },
  dateTime: {
    width: '60%',
    height: 20,
    borderRadius: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    width: 120,
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  location: {
    width: '80%',
    height: 20,
    borderRadius: 4,
  },
  descriptionLine: {
    width: '100%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
  },
}); 