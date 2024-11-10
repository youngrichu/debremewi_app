import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlogPostPreview } from '../components/BlogPostPreview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { EventsPreview } from '../components/Events/EventsPreview';
import { EventService } from '../services/EventService';
import { Event } from '../../types';
import { Post } from '../types';
import { API_URL } from '../config';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const navigateToSection = (section: keyof RootStackParamList) => {
    switch (section) {
      case 'Events':
        navigation.navigate('Events');
        break;
      case 'BlogPosts':
        navigation.navigate('BlogPosts');
        break;
      case 'Notifications':
        navigation.navigate('Notifications');
        break;
      default:
        navigation.navigate(section);
    }
  };

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await EventService.getEvents({
          per_page: 3,
        });
        console.log('Fetched events:', events);
        if (!Array.isArray(events)) {
          console.error('Events is not an array:', events);
          setUpcomingEvents([]);
          setError('Invalid events data received');
          return;
        }
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Error loading upcoming events:', error);
        setError('Failed to load upcoming events');
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEvents();
  }, []);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?_embed&per_page=3`);
        const posts = await response.json();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadBlogPosts();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Remove the header with notification icon and just keep the welcome text */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Church App</Text>
      </View>

      {/* Quick Actions Grid */}
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
          onPress={() => {}} // Reserved for future feature
        >
          <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="people" size={32} color="#FFF" />
          </View>
          <Text style={styles.quickActionText}>Community</Text>
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
        <View style={styles.blogPostsContent}>
          {loadingPosts ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <BlogPostPreview
              posts={blogPosts}
              onPostPress={(post) => navigation.navigate('BlogPostDetail', { post })}
              limit={3}
            />
          )}
        </View>
      </View>

      {/* Upcoming Events Preview Section */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <EventsPreview 
              events={upcomingEvents}
              onEventPress={(eventId) => navigation.navigate('EventDetails', { eventId })}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  lastSection: {
    marginBottom: 20, // Add padding at the bottom of the last section
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
  },
  blogPostsContent: {
    // Remove fixed height to make it responsive
    minHeight: 100,
  },
  eventsContent: {
    // Remove fixed height to make it responsive
    minHeight: 100,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
});
