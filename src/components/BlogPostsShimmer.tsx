import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { IS_TABLET, getContainerWidth } from '../utils/responsive';

const ShimmerComponent = ShimmerPlaceholder as any;

export const BlogPostsShimmer = () => {
  const shimmerItems = IS_TABLET ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { width: getContainerWidth(), alignSelf: 'center' }]}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.searchPlaceholder}
        />
      </View>

      <View style={styles.listContainer}>
        {shimmerItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.blogPost,
              IS_TABLET && styles.tabletCard
            ]}
          >
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
              <View style={styles.footer}>
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.blogDate}
                />
                <ShimmerComponent
                  LinearGradient={LinearGradient}
                  style={styles.blogAuthor}
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
  searchBar: {
    margin: 16,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    width: '100%',
    height: 20,
    borderRadius: 4,
  },
  listContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: IS_TABLET ? 'space-between' : 'center',
  },
  blogPost: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabletCard: {
    width: '48%',
  },
  blogImage: {
    width: '100%',
    height: IS_TABLET ? 300 : 200,
  },
  blogDetails: {
    padding: 16,
    gap: 12,
  },
  blogTitle: {
    width: '90%',
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  blogExcerpt: {
    width: '100%',
    height: 60,
    borderRadius: 4,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  blogDate: {
    width: '30%',
    height: 16,
    borderRadius: 4,
  },
  blogAuthor: {
    width: '20%',
    height: 16,
    borderRadius: 4,
  },
}); 