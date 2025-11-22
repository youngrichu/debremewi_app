import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { IS_TABLET } from '../utils/responsive';

const ShimmerComponent = ShimmerPlaceholder as any;

export const EventsShimmer = () => {
  return (
    <View style={styles.container}>
      {/* Calendar Header Shimmer */}
      <View style={styles.calendarHeader}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.monthTitle}
        />
        <View style={styles.weekDays}>
          {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
            <ShimmerComponent
              key={index}
              LinearGradient={LinearGradient}
              style={styles.weekDay}
            />
          ))}
        </View>
      </View>

      {/* Events List Shimmer */}
      <View style={styles.eventsList}>
        {[1, 2, 3, 4].map((_, index) => (
          <View key={index} style={[styles.eventCard, IS_TABLET && styles.tabletEventCard]}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={[styles.imagePlaceholder, IS_TABLET && styles.tabletImagePlaceholder]}
            />
            <View style={styles.eventContent}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.eventTitle}
              />
              <View style={styles.eventDetails}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.eventTime}
                />
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.eventLocation}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendarHeader: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  monthTitle: {
    width: 150,
    height: 24,
    marginBottom: 16,
    borderRadius: 4,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    width: 32,
    height: 20,
    borderRadius: 4,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'column',
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
  tabletEventCard: {
    flexDirection: 'row',
    width: '95%',
    alignSelf: 'center',
    height: 140, // Fixed height for shimmer consistency
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  tabletImagePlaceholder: {
    width: '35%',
    height: '100%',
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    width: '90%',
    height: 24,
    borderRadius: 4,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventTime: {
    width: '40%',
    height: 16,
    borderRadius: 4,
  },
  eventLocation: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
}); 