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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<SocialMediaPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1); // Reset page when refreshing
      } else if (!loading) {
        setLoadingMore(true);
      }
      
      const currentPage = isRefresh ? 1 : page;
      console.log('Fetching videos with params:', {
        platform: 'youtube',
        type: 'video',
        page: currentPage,
        per_page: 6,
        sort: 'date',
        order: 'desc'
      });

      const response = await SocialMediaService.getFeed({
        platform: 'youtube',
        type: 'video',
        page: currentPage,
        per_page: 6,
        sort: 'date',
        order: 'desc',
      });

      console.log('API Response:', {
        status: response?.status,
        pagination: response?.data?.pagination,
        itemCount: response?.data?.items?.length,
        firstItem: response?.data?.items?.[0]?.content?.created_at,
        lastItem: response?.data?.items?.[response?.data?.items?.length - 1]?.content?.created_at
      });

      if (response?.status === 'success' && response.data?.items) {
        const newVideos = response.data.items;
        
        if (isRefresh) {
          // For refresh, just set the new videos
          setVideos(newVideos);
        } else {
          // For pagination, combine with existing videos and remove duplicates
          setVideos(prevVideos => {
            const allVideos = [...prevVideos, ...newVideos];
            // Remove duplicates by ID and maintain order
            const seen = new Set();
            return allVideos.filter(video => {
              if (seen.has(video.id)) {
                return false;
              }
              seen.add(video.id);
              return true;
            });
          });
        }
        
        // Only update hasMore if we have a valid pagination response
        if (response.data.pagination) {
          const hasMorePages = currentPage < response.data.pagination.total_pages;
          setHasMore(hasMorePages);
          
          // If we're not refreshing and there are more pages, increment the page
          if (!isRefresh && hasMorePages) {
            setPage(currentPage + 1);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setError(t('youtube.error'));
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setError(t('youtube.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !refreshing) {
      loadVideos(false);
    }
  };

  const handleRefresh = () => {
    loadVideos(true);
  };

  const openVideo = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  if (loading && !videos.length) {
    return <YouTubeFeedShimmer />;
  }

  if (error && !videos.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadVideos(true)}>
          <Text style={styles.retryButtonText}>{t('youtube.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onScrollEndDrag={handleLoadMore}
    >
      {videos.map((video, index) => (
        <TouchableOpacity 
          key={`${video.id}-${index}`}
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
              <View style={styles.engagementStats}>
                <View style={styles.stat}>
                  <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{video.content.engagement.likes}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="chatbubble-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{video.content.engagement.comments}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {loadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
    resizeMode: 'cover',
  },
  videoInfo: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 22,
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
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default YouTubeFeedScreen; 