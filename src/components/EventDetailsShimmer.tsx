import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { IS_TABLET } from '../utils/responsive';

const ShimmerComponent = ShimmerPlaceholder as any;

export const EventDetailsShimmer = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Event Image Shimmer */}
      <ShimmerComponent
        LinearGradient={LinearGradient}
        style={styles.eventImage}
      />

      {/* Event Content */}
      <View style={styles.content}>
        {/* Event Title */}
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.title}
        />

        {/* Meta Container */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaIcon}
            />
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaText}
            />
          </View>
          <View style={styles.metaRow}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaIcon}
            />
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaTextLarge}
            />
          </View>
          <View style={styles.metaRow}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaIcon}
            />
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.metaText}
            />
          </View>
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

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.descriptionTitle}
          />
          {[1, 2, 3, 4, 5].map((_, index) => (
            <ShimmerComponent
              key={index}
              LinearGradient={LinearGradient}
              style={styles.descriptionLine}
            />
          ))}
        </View>
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
    height: IS_TABLET ? 400 : 250,
  },
  content: {
    padding: IS_TABLET ? 24 : 16,
  },
  title: {
    width: '90%',
    height: IS_TABLET ? 36 : 28,
    borderRadius: 4,
    marginBottom: 16,
  },
  metaContainer: {
    backgroundColor: '#f8f8f8',
    padding: IS_TABLET ? 16 : 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    width: IS_TABLET ? 28 : 24,
    height: IS_TABLET ? 28 : 24,
    borderRadius: 4,
  },
  metaText: {
    flex: 1,
    height: IS_TABLET ? 22 : 18,
    borderRadius: 4,
  },
  metaTextLarge: {
    flex: 1,
    height: IS_TABLET ? 44 : 36,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: IS_TABLET ? 16 : 12,
  },
  actionButton: {
    flex: 1,
    height: IS_TABLET ? 52 : 44,
    borderRadius: 8,
  },
  descriptionContainer: {
    marginTop: 16,
    padding: IS_TABLET ? 20 : 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 12,
  },
  descriptionTitle: {
    width: '40%',
    height: IS_TABLET ? 26 : 22,
    borderRadius: 4,
    marginBottom: 8,
  },
  descriptionLine: {
    width: '100%',
    height: IS_TABLET ? 22 : 18,
    borderRadius: 4,
  },
}); 