import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Post } from '../types';
import { API_URL } from '../config';
import { RootStackParamList } from '../types';

type BlogPostsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootStackParamList, 'BlogPosts'>,
  StackNavigationProp<RootStackParamList>
>;

export default function BlogPostsScreen() {
  const navigation = useNavigation<BlogPostsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?_embed`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post: Post) => {
    // Navigate to HomeStack first, then to BlogPostDetail
    navigation.navigate('HomeStack', {
      screen: 'BlogPostDetail',
      params: { post }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item)}
    >
      {item._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
        <Image
          source={{ uri: item._embedded['wp:featuredmedia'][0].source_url }}
          style={styles.postImage}
        />
      )}
      <View style={styles.postContent}>
        <Text style={styles.title}>{item.title.rendered}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {item.excerpt.rendered.replace(/<[^>]*>/g, '')}
        </Text>
        <View style={styles.postFooter}>
          <Text style={styles.date}>
            {new Date(item.date || '').toLocaleDateString()}
          </Text>
          <Text style={styles.readMore}>Read More →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  postContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  readMore: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
}); 