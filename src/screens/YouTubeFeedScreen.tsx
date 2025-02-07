import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import SocialMediaService, { SocialMediaPost } from '../services/SocialMediaService';
import { Ionicons } from '@expo/vector-icons';
import { YouTubeFeedShimmer } from '../components/YouTubeFeedShimmer';

const YouTubeFeedScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<SocialMediaPost[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SocialMediaService.getFeed({
        platform: 'youtube',
        type: 'video',
        page: 1,
        per_page: 12,
        sort: 'date',
        order: 'desc',
      });

      if (!response?.data?.items) {
        console.error('Invalid response format:', response);
        setError(t('youtube.error'));
        return;
      }

      setVideos(response.data.items);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError(t('youtube.error'));
    } finally {
      setLoading(false);
    }
  };

  const openVideo = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening video:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadVideos();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <YouTubeFeedShimmer />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
          <Text style={styles.retryButtonText}>{t('youtube.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!videos.length) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.centerContainer}>
          <Text style={styles.noVideosText}>{t('youtube.noVideos')}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {videos.map((video) => (
        <TouchableOpacity 
          key={video.id} 
          style={styles.videoCard}
          onPress={() => openVideo(video.content.media_url)}
        >
          <Image
            source={{ uri: video.content.thumbnail_url }}
            style={styles.thumbnail}
          />
          <View style={styles.videoInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {video.content.title}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.authorInfo}>
                {video.author.avatar && (
                  <Image 
                    source={{ uri: video.author.avatar }} 
                    style={styles.authorAvatar}
                  />
                )}
                <Text style={styles.authorName}>{video.author.name}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text style={styles.statText}>{video.content.engagement.likes}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noVideosText: {
    color: '#666',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#666',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default YouTubeFeedScreen; 