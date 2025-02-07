import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const ShimmerComponent = ShimmerPlaceholder as any;

export const BlogPostsShimmer = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((_, index) => (
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
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.blogDate}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  blogPost: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: '80%',
    height: 32,
    borderRadius: 4,
  },
  blogDate: {
    width: '30%',
    height: 16,
    borderRadius: 4,
  },
}); 