import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '../types';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  const isBlogPost = notification.type === 'blog_post';

  const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&hellip;/g, '...');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        notification.is_read === '0' && styles.unread,
        isBlogPost && styles.blogPost
      ]}
      onPress={onPress}
    >
      {notification.featured_image?.url && (
        <Image
          source={{ uri: notification.featured_image.url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{stripHtml(notification.title)}</Text>
        {notification.excerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {stripHtml(notification.excerpt)}
          </Text>
        )}
        <Text style={styles.body} numberOfLines={2}>
          {stripHtml(notification.body)}
        </Text>
        <Text style={styles.date}>
          {new Date(notification.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  unread: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  blogPost: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
}); 