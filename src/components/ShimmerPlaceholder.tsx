import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const ShimmerComponent = ShimmerPlaceholder as any;

export const HomeScreenShimmer = () => {
  return (
    <View style={styles.container}>
      {/* Welcome Card Shimmer */}
      <ShimmerComponent
        LinearGradient={LinearGradient}
        style={styles.welcomeCard}
      />

      {/* Events Section Shimmer */}
      <View style={styles.section}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        <View style={styles.eventsContainer}>
          {[1, 2].map((_, index) => (
            <View key={index} style={styles.eventCard}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.eventImage}
              />
              <View style={styles.eventDetails}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.eventTitle}
                />
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.eventDate}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Blog Posts Section Shimmer */}
      <View style={styles.section}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        {[1, 2].map((_, index) => (
          <View key={index} style={styles.blogPost}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.blogImage}
            />
            <View style={styles.blogDetails}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.blogTitle}
              />
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.blogExcerpt}
              />
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
    padding: 16,
    backgroundColor: '#fff',
  },
  welcomeCard: {
    height: 120,
    borderRadius: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    width: 150,
    height: 24,
    borderRadius: 4,
    marginBottom: 16,
  },
  eventsContainer: {
    gap: 16,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  eventImage: {
    width: 100,
    height: 100,
  },
  eventDetails: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  eventTitle: {
    width: '80%',
    height: 20,
    borderRadius: 4,
  },
  eventDate: {
    width: '40%',
    height: 16,
    borderRadius: 4,
  },
  blogPost: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  blogImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  blogDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  blogTitle: {
    width: '90%',
    height: 20,
    borderRadius: 4,
  },
  blogExcerpt: {
    width: '70%',
    height: 16,
    borderRadius: 4,
  },
}); 