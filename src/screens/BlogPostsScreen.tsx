import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Post } from '../types';
import { BlogPostCard } from '../components/BlogPostCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { API_URL } from '../config';

type BlogPostsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BlogPosts'>;

export default function BlogPostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<BlogPostsScreenNavigationProp>();

  const loadPosts = async (pageNumber: number = 1, shouldRefresh: boolean = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      }
      const response = await fetch(
        `${API_URL}/wp-json/wp/v2/posts?_embed&per_page=10&page=${pageNumber}`
      );
      const data = await response.json();
      
      if (data.length < 10) {
        setHasMore(false);
      }

      if (shouldRefresh || pageNumber === 1) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <BlogPostCard
      post={item}
      onPress={() => navigation.navigate('BlogPostDetail', { post: item })}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && hasMore ? (
            <ActivityIndicator size="small" color="#2196F3" style={styles.footer} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  footer: {
    paddingVertical: 20,
  },
}); 