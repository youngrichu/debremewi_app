import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { IS_TABLET, getContainerWidth } from '../utils/responsive';

const ShimmerComponent = ShimmerPlaceholder as any;

export const HomeScreenShimmer = () => {
  return (
    <View style={styles.container}>
      {/* Welcome Card Shimmer */}
      <View style={[styles.welcomeCardShimmer, IS_TABLET && styles.tabletWelcomeCardShimmer]}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.welcomeImage}
        />
      </View>

      {/* Quick Actions Shimmer */}
      <View style={[styles.quickActionsShimmer, IS_TABLET && styles.tabletQuickActionsShimmer]}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.quickActionItem}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={[styles.quickActionIcon, IS_TABLET && styles.tabletQuickActionIcon]}
            />
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.quickActionText}
            />
          </View>
        ))}
      </View>

      {/* Events Section Shimmer */}
      <View style={[styles.section, IS_TABLET && styles.tabletSection]}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        <View style={[styles.eventsContainer, IS_TABLET && styles.tabletGridContainer]}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={[styles.eventCard, IS_TABLET && styles.tabletEventCard]}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={[styles.eventImage, IS_TABLET && styles.tabletEventImage]}
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
      <View style={[styles.section, IS_TABLET && styles.tabletSection]}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        <View style={IS_TABLET ? styles.tabletGridContainer : undefined}>
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} style={[styles.blogPost, IS_TABLET && styles.tabletBlogPost]}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={[styles.blogImage, IS_TABLET && styles.tabletBlogImage]}
              />
              <View style={[styles.blogDetails, IS_TABLET && styles.tabletBlogDetails]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCardShimmer: {
    height: 200,
    margin: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  quickActionsShimmer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  quickActionText: {
    width: 60,
    height: 12,
    borderRadius: 4,
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
  // Tablet Styles
  tabletSection: {
    width: getContainerWidth() as any,
    alignSelf: 'center',
  },
  tabletGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabletEventCard: {
    width: '32%',
    flexDirection: 'column',
  },
  tabletEventImage: {
    width: '100%',
    height: 150,
  },
  tabletBlogPost: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 24,
  },
  tabletBlogImage: {
    width: '100%',
    height: 180,
    marginBottom: 12,
  },
  tabletBlogDetails: {
    marginLeft: 0,
  },
  tabletWelcomeCardShimmer: {
    height: 250, // Taller on tablets
    width: getContainerWidth() as any,
    alignSelf: 'center',
    marginBottom: 24,
  },
  tabletQuickActionsShimmer: {
    width: getContainerWidth() as any,
    alignSelf: 'center',
    borderRadius: 12,
    paddingVertical: 30,
  },
  tabletQuickActionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
}); 