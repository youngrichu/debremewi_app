import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const ShimmerComponent = ShimmerPlaceholder as any;

export const YouTubeFeedShimmer = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.videoCard}>
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.thumbnail}
          />
          <View style={styles.videoInfo}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.videoTitle}
            />
            <View style={styles.videoStats}>
              <View style={styles.authorInfo}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.authorAvatar}
                />
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.authorName}
                />
              </View>
              <View style={styles.stats}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.statItem}
                />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    width: '90%',
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
}); 