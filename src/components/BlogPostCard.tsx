import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { decode } from 'html-entities';
import { Post } from '../types';
import { getFontSize, IS_TABLET } from '../utils/responsive';

interface BlogPostCardProps {
  post: Post;
  onPress: () => void;
  style?: ViewStyle;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onPress, style }) => {
  const stripHtmlAndDecode = (html: string): string => {
    if (!html) return '';
    // First remove HTML tags
    const stripped = html.replace(/<[^>]*>/g, '');
    // Then decode HTML entities
    return decode(stripped);
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
        <Image
          source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {stripHtmlAndDecode(post.title.rendered)}
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {stripHtmlAndDecode(post.excerpt.rendered)}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>
            {new Date(post.date || '').toLocaleDateString()}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: IS_TABLET ? 300 : 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  excerpt: {
    fontSize: getFontSize(14),
    color: '#666',
    marginBottom: 12,
    lineHeight: getFontSize(20),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: getFontSize(12),
    color: '#999',
  },
  author: {
    fontSize: getFontSize(12),
    color: '#666',
  },
}); 