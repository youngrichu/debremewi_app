import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { format } from 'date-fns';
import apiClient from '../api/client';

interface NotificationCardProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type?: string;
    is_read: '0' | '1';
    created_at: string;
    reference_id?: string;
    reference_type?: string;
    reference_url?: string;
    image_url?: string | null;
  };
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 180;

export const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  const [eventImage, setEventImage] = useState<string | null>(null);

  // Default placeholder image URL
  const DEFAULT_IMAGE = 'https://staging.dubaidebremewi.com/wp-content/uploads/2024/02/default-event-placeholder.jpg';

  // Fetch image for event or blog post notification
  useEffect(() => {
    const fetchImage = async () => {
      if (!notification.reference_id) return;

      try {
        if (notification.reference_type === 'blog') {
          console.log('Blog Post Notification:', {
            reference_id: notification.reference_id,
            reference_type: notification.reference_type,
            reference_url: notification.reference_url
          });

          // Fetch blog post image
          const response = await apiClient.get(`/wp-json/wp/v2/posts/${notification.reference_id}`);
          console.log('Blog Post API Response:', JSON.stringify(response.data, null, 2));

          const postData = response.data;
          if (!postData) {
            console.log('No post data found');
            setEventImage(DEFAULT_IMAGE);
            return;
          }

          // Get featured image ID
          const featuredMediaId = postData.featured_media;
          
          if (featuredMediaId) {
            // Fetch the media details
            const mediaResponse = await apiClient.get(`/wp-json/wp/v2/media/${featuredMediaId}`);
            console.log('Media API Response:', JSON.stringify(mediaResponse.data, null, 2));
            
            const mediaUrl = mediaResponse.data?.source_url;
            if (mediaUrl) {
              console.log('Found blog post image:', mediaUrl);
              setEventImage(mediaUrl);
            } else {
              console.log('No blog post image URL found. Using default image.');
              setEventImage(DEFAULT_IMAGE);
            }
          } else {
            console.log('No featured media ID found. Using default image.');
            setEventImage(DEFAULT_IMAGE);
          }
        } else if (notification.reference_type === 'church_event') {
          const response = await apiClient.get(`/wp-json/church-events/v1/events/${notification.reference_id}?_embed`);
          const eventData = response.data?.event || response.data;
          if (eventData?.thumbnail) {
            setEventImage(eventData.thumbnail);
          } else {
            setEventImage(DEFAULT_IMAGE);
          }
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setEventImage(DEFAULT_IMAGE);
      }
    };

    fetchImage();
  }, [notification.reference_id, notification.reference_type]);

  // Use notification image_url or fetched image
  const imageUrl = notification.image_url || eventImage;

  // Debug log
  console.log('NotificationCard - data:', {
    id: notification.id,
    type: notification.type,
    image_url: notification.image_url,
    event_image: eventImage,
    reference_type: notification.reference_type,
    reference_id: notification.reference_id,
    reference_url: notification.reference_url,
    final_image_url: imageUrl
  });

  // Format the notification type for display
  const getFormattedType = (type: string | undefined) => {
    if (!type) return '';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get badge color based on notification type
  const getBadgeColor = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'event':
        return {
          background: '#e8f5e9',
          text: '#2e7d32'
        };
      case 'blog_post':
        return {
          background: '#e3f2fd',
          text: '#1976d2'
        };
      case 'general':
        return {
          background: '#f5f5f5',
          text: '#616161'
        };
      default:
        return {
          background: '#f5f5f5',
          text: '#616161'
        };
    }
  };

  const badgeColors = getBadgeColor(notification.type);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        notification.is_read === '0' && styles.unread
      ]}
      onPress={() => {
        // If there's a reference URL, use it directly
        if (notification.reference_url) {
          console.log('Using provided reference URL:', notification.reference_url);
          onPress();
        } else if (notification.reference_type === 'blog' && notification.reference_id) {
          // For blog posts without reference URL, construct the URL
          const blogUrl = `https://staging.dubaidebremewi.com/?p=${notification.reference_id}`;
          console.log('Navigating to blog post:', blogUrl);
          onPress();
        } else {
          // For other types or when no reference info is available
          onPress();
        }
      }}
    >
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {notification.type && (
            <View style={[
              styles.badgeOverlay,
              { backgroundColor: badgeColors.background }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: badgeColors.text }
              ]}>
                {getFormattedType(notification.type)}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          {!imageUrl && notification.type && (
            <View style={[
              styles.badge,
              { backgroundColor: badgeColors.background }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: badgeColors.text }
              ]}>
                {getFormattedType(notification.type)}
              </Text>
            </View>
          )}
          <Text style={styles.date}>
            {format(new Date(notification.created_at), 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text style={[
          styles.title,
          notification.is_read === '0' && styles.unreadTitle
        ]}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  unread: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  unreadTitle: {
    color: '#1976d2',
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});