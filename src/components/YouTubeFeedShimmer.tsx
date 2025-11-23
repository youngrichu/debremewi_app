import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { IS_TABLET } from '../utils/responsive';

const ShimmerComponent = ShimmerPlaceholder as any;

export const YouTubeFeedShimmer = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((_, index) => (
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
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.videoTitleSecondLine}
            />
            <View style={styles.statsRow}>
              <View style={styles.engagementStats}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.statItem}
                />
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
    paddingVertical: 8,
  },
  videoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: IS_TABLET ? 300 : 200,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    padding: IS_TABLET ? 20 : 16,
  },
  videoTitle: {
    width: '90%',
    height: IS_TABLET ? 24 : 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  videoTitleSecondLine: {
    width: '70%',
    height: IS_TABLET ? 24 : 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  engagementStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: IS_TABLET ? 20 : 16,
  },
  statItem: {
    width: IS_TABLET ? 70 : 60,
    height: IS_TABLET ? 20 : 16,
    borderRadius: 4,
  },
}); 