import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Post, Event } from '../types';
import { API_URL } from '../config';
import WelcomeCard from '../components/WelcomeCard';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchRecentPosts();
    fetchUpcomingEvents();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?per_page=3&_embed`);
      const posts = await response.json();
      setRecentPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/wp-json/tribe/v1/events?per_page=3`);
      const data = await response.json();
      setUpcomingEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const renderEvents = () => {
    if (upcomingEvents.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            No upcoming events at the moment
          </Text>
        </View>
      );
    }

    return upcomingEvents.slice(0, 3).map((event) => (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
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
              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Ionicons name="location-outline" size={12} color="#666" style={[styles.eventIcon, styles.locationIcon]} />
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <WelcomeCard />

      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('Events')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="calendar" size={32} color="#FFF" />
          </View>
          <Text style={styles.quickActionText}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('BlogPosts')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="newspaper" size={32} color="#FFF" />
          </View>
          <Text style={styles.quickActionText}>Blog Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('More', {
            screen: 'Location'
          })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="location" size={32} color="#FFF" />
          </View>
          <Text style={styles.quickActionText}>Location</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Blog Posts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Blog Posts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BlogPosts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.blogCard}
            onPress={() => navigation.navigate('BlogPostDetail', { post })}
          >
            <View style={styles.blogCardContent}>
              {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                <Image
                  source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                  style={styles.blogThumbnail}
                />
              )}
              <View style={styles.blogTextContent}>
                <Text style={styles.blogTitle}>{post.title.rendered}</Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>
                  {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                </Text>
                <Text style={styles.blogDate}>
                  {new Date(post.date || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {renderEvents()}
      </View>
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
});
