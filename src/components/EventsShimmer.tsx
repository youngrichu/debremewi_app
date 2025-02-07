import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

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
          <View key={index} style={styles.eventCard}>
            <View style={styles.dateBox}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.dateDay}
              />
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.dateMonth}
              />
            </View>
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateBox: {
    width: 60,
    backgroundColor: '#f0f0f0',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  dateMonth: {
    width: 40,
    height: 16,
    borderRadius: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    width: '90%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
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