import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Post, Event, RootStackParamList, MainTabParamList } from '../types';
import { API_URL } from '../config';
import WelcomeCard from '../components/WelcomeCard';
import { useTranslation } from 'react-i18next';
import { getUpcomingEvents } from '../services/EventsService';
import { EventService } from '../services/EventService';
import SocialMediaService, { SocialMediaPost } from '../services/SocialMediaService';
import { isAfter, isSameDay } from 'date-fns';
import { decode } from 'html-entities';
import { HomeScreenShimmer } from '../components/ShimmerPlaceholder';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<any>
>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [latestVideos, setLatestVideos] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add refresh interval (e.g., every 5 minutes)
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?per_page=3&_embed`);
      const posts = await response.json();
      setRecentPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let allEvents: Event[] = [];
      let currentPage = 1;
      let hasMore = true;

      // Fetch all pages until we find upcoming events or run out of pages
      while (hasMore) {
        const eventsResult = await EventService.getEvents({
          page: currentPage,
          per_page: 10,
          orderby: 'date',
          order: 'ASC'
        });

        allEvents = [...allEvents, ...eventsResult.events];
        
        // Check if we have any upcoming events in this batch
        const hasUpcomingEvents = eventsResult.events.some(event => {
          const eventDate = new Date(event.date);
          return isAfter(eventDate, today) || isSameDay(eventDate, today);
        });

        // Stop if we found upcoming events or there are no more pages
        if (hasUpcomingEvents || !eventsResult.hasMore) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      // Filter and sort all collected events
      const upcomingEvents = allEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          return isAfter(eventDate, today) || isSameDay(eventDate, today);
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      setUpcomingEvents(upcomingEvents);
      setError('');
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestVideos = async () => {
    try {
      const response = await SocialMediaService.getFeed({
        platform: 'youtube',
        type: 'video',
        page: 1,
        per_page: 6, // Request more videos to ensure we have enough after filtering
        sort: 'date',
        order: 'desc',
      });
      if (response?.status === 'success' && response.data?.items) {
        // Filter out duplicates and ensure we get exactly 3 videos
        const uniqueVideos = Array.from(
          new Map(response.data.items.map((item: SocialMediaPost) => [item.id, item])).values()
        ) as SocialMediaPost[];
        setLatestVideos(uniqueVideos.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching latest videos:', error);
    }
  };

  useEffect(() => {
    // Initial fetch for blog posts, events, and videos
    fetchRecentPosts();
    fetchUpcomingEvents();
    fetchLatestVideos();

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      fetchUpcomingEvents();
      fetchLatestVideos();
    }, REFRESH_INTERVAL);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchUpcomingEvents]);

  // Add refresh on focus for all sections
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecentPosts();
      fetchUpcomingEvents();
      fetchLatestVideos();
    });

    return unsubscribe;
  }, [navigation, fetchUpcomingEvents]);

  const renderEvents = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#2196F3" />;
    }

    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{error}</Text>
        </View>
      );
    }

    if (upcomingEvents.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {t('home.sections.upcomingEvents.empty')}
          </Text>
        </View>
      );
    }

    return upcomingEvents.slice(0, 3).map((event) => (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => handleEventPress(Number(event.id))}
      >
        <View style={styles.eventDateBox}>
          <Text style={styles.eventDateDay}>
            {new Date(event.date).getDate()}
          </Text>
          <Text style={styles.eventDateMonth}>
            {new Date(event.date).toLocaleString('default', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventDetails}>
            <Ionicons name="time-outline" size={12} color="#666" style={styles.eventIcon} />
            <Text style={styles.eventTime}>
              {new Date(event.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {event.end_date && (
                <> - {new Date(event.end_date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</>
              )}
            </Text>
            {event.location && (
              <>
                <Ionicons name="location-outline" size={12} color="#666" style={[styles.eventIcon, styles.locationIcon]} />
                <Text style={styles.eventLocation}>{event.location}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  const handleEventPress = (eventId: number) => {
    navigation.navigate('Events', {
      screen: 'EventDetails',
      params: { eventId },
    });
  };

  const handleBlogPostPress = (post: Post) => {
    navigation.navigate('BlogPosts', {
      post,
    });
  };

  const handleViewAllEventsPress = () => {
    navigation.navigate('Events');
  };

  const handleViewAllBlogPostsPress = () => {
    navigation.navigate('BlogPosts');
  };

  const handleViewAllYouTubePress = () => {
    navigation.navigate('YouTube');
  };

  const handleMorePress = (screen: string) => {
    navigation.navigate('More', { screen });
  };

  const handleVideoPress = async (video: SocialMediaPost) => {
    try {
      await Linking.openURL(video.content.media_url);
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <HomeScreenShimmer />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <WelcomeCard />

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleViewAllEventsPress()}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="calendar" size={32} color="#FFF" />
              </View>
              <Text style={styles.quickActionText}>{t('home.quickActions.events')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleViewAllBlogPostsPress()}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="newspaper" size={32} color="#FFF" />
              </View>
              <Text style={styles.quickActionText}>{t('home.quickActions.blog')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleMorePress('Location')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="location" size={32} color="#FFF" />
              </View>
              <Text style={styles.quickActionText}>{t('home.quickActions.location')}</Text>
            </TouchableOpacity>
          </View>

          {/* Latest YouTube Videos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.sections.latestVideos.title', 'Latest Videos')}</Text>
              <TouchableOpacity onPress={() => handleViewAllYouTubePress()}>
                <Text style={styles.seeAllText}>{t('home.sections.latestVideos.seeAll', 'See All')}</Text>
              </TouchableOpacity>
            </View>
            {latestVideos.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {t('home.sections.latestVideos.empty', 'No videos available')}
                </Text>
              </View>
            ) : (
              latestVideos.map((video, index) => (
                <TouchableOpacity
                  key={`${video.id}-${index}`}
                  style={styles.videoCard}
                  onPress={() => handleVideoPress(video)}
                >
                  <Image
                    source={{ uri: video.content.thumbnail_url }}
                    style={styles.videoThumbnail}
                  />
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.content.title}
                    </Text>
                    <View style={styles.videoStats}>
                      <View style={styles.stat}>
                        <Ionicons name="thumbs-up-outline" size={12} color="#666" />
                        <Text style={styles.statText}>{video.content.engagement.likes}</Text>
                      </View>
                      <View style={styles.stat}>
                        <Ionicons name="chatbubble-outline" size={12} color="#666" />
                        <Text style={styles.statText}>{video.content.engagement.comments}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Recent Blog Posts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.sections.recentPosts.title')}</Text>
              <TouchableOpacity onPress={() => handleViewAllBlogPostsPress()}>
                <Text style={styles.seeAllText}>{t('home.sections.recentPosts.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {recentPosts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>{t('home.sections.recentPosts.empty')}</Text>
              </View>
            ) : (
              recentPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.blogCard}
                  onPress={() => handleBlogPostPress(post)}
                >
                  <View style={styles.blogCardContent}>
                    {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                      <Image
                        source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                        style={styles.blogThumbnail}
                      />
                    )}
                    <View style={styles.blogTextContent}>
                      <Text style={styles.blogTitle}>{decode(post.title.rendered)}</Text>
                      <Text style={styles.blogExcerpt} numberOfLines={2}>
                        {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                      </Text>
                      <Text style={styles.blogDate}>
                        {new Date(post.date || '').toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Upcoming Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.sections.upcomingEvents.title')}</Text>
              <TouchableOpacity onPress={() => handleViewAllEventsPress()}>
                <Text style={styles.seeAllText}>{t('home.sections.upcomingEvents.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {renderEvents()}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
  },
  blogCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blogCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  blogThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  blogTextContent: {
    flex: 1,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  blogExcerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDateBox: {
    width: 60,
    backgroundColor: '#FF9800',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventDateMonth: {
    fontSize: 12,
    color: '#fff',
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    marginRight: 4,
  },
  locationIcon: {
    marginLeft: 12,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 22,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
