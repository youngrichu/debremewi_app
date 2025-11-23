import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { Post, RootStackParamList } from '../types';
import { BlogPostsShimmer } from '../components/BlogPostsShimmer';
import { BlogPostCard } from '../components/BlogPostCard';
import { IS_TABLET, getContainerWidth } from '../utils/responsive';

type BlogPostsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BlogPostsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<BlogPostsScreenNavigationProp>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?_embed`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(t('blog.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  if (loading) {
    return <BlogPostsShimmer />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryButtonText}>{t('blog.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredPosts = posts.filter(post =>
    post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.rendered.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { width: getContainerWidth(), alignSelf: 'center' }]}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('blog.search.placeholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? t('blog.search.noResults') : t('blog.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <BlogPostCard
              post={item}
              onPress={() => navigation.navigate('BlogPostDetail', { post: item })}
              style={IS_TABLET ? { flex: 1, margin: 8 } : undefined}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          numColumns={IS_TABLET ? 2 : 1}
          key={IS_TABLET ? 'tablet' : 'mobile'}
          columnWrapperStyle={IS_TABLET ? { justifyContent: 'space-between' } : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
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
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default BlogPostsScreen; 