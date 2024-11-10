import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Post } from '../types';

interface BlogPostPreviewProps {
  posts: Post[];
  onPostPress: (post: Post) => void;
  limit?: number;
}

export const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  posts,
  onPostPress,
  limit = 3,
}) => {
  const previewPosts = posts.slice(0, limit);

  const stripHtmlAndDecode = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&hellip;/g, '...');
  };

  if (previewPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No blog posts available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {previewPosts.map((post) => (
        <TouchableOpacity
          key={post.id}
          style={styles.postCard}
          onPress={() => onPostPress(post)}
        >
          <View style={styles.postContent}>
            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <Image
                source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.textContent}>
              <Text style={styles.title} numberOfLines={2}>
                {stripHtmlAndDecode(post.title.rendered)}
              </Text>
              <Text style={styles.excerpt} numberOfLines={2}>
                {stripHtmlAndDecode(post.excerpt.rendered)}
              </Text>
              <Text style={styles.date}>
                {new Date(post.date || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    margin: 8,
  },
  textContent: {
    flex: 1,
    padding: 8,
    paddingLeft: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
}); 