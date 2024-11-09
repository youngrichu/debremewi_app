import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Post } from '../types';

interface BlogPostCardProps {
  post: Post;
  onPress: () => void;
}

export const BlogPostCard = ({ post, onPress }: BlogPostCardProps) => {
  // Function to strip HTML tags and decode HTML entities
  const stripHtmlAndDecode = (html: string): string => {
    if (!html) return '';
    
    // First decode HTML entities
    const decoded = html.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&hellip;/g, '...');
    
    // Then strip HTML tags
    return decoded.replace(/<[^>]*>/g, '');
  };

  // Get featured image URL from _embedded data
  const getFeaturedImageUrl = (): string | undefined => {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return undefined;
  };

  const imageUrl = getFeaturedImageUrl();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>
          {stripHtmlAndDecode(post.title?.rendered || '')}
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {stripHtmlAndDecode(post.excerpt?.rendered || '')}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>
            {post.date ? new Date(post.date).toLocaleDateString() : ''}
          </Text>
          {post._embedded?.author?.[0]?.name && (
            <Text style={styles.author}>
              By {post._embedded.author[0].name}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
}); 