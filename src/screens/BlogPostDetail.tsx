import React, { useState } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, Dimensions, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { Post } from '../types';
import HTMLView from 'react-native-htmlview';

interface BlogPostDetailProps {
  route: {
    params: {
      post: Post;
    };
  };
}

export default function BlogPostDetail({ route }: BlogPostDetailProps) {
  const { post } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const { width } = Dimensions.get('window');

  const stripHtmlAndDecode = (html: string): string => {
    if (!html) return '';
    const decoded = html.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&hellip;/g, '...')
      .replace(/&nbsp;/g, ' ');
    return decoded.replace(/<[^>]*>/g, '');
  };

  const getFeaturedImageUrl = (): string | undefined => {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return undefined;
  };

  const imageUrl = getFeaturedImageUrl();

  const processContent = (content: string): string => {
    let processedContent = content
      .replace(/<figure[^>]*>.*?<\/figure>/, '')
      .replace(/\s*<p>\s*/g, '<p>')
      .replace(/\s*<\/p>\s*/g, '</p>')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
    
    return processedContent;
  };

  const renderNode = (node: any, index: number) => {
    switch (node.name) {
      case 'figure':
        const imgNode = node.children?.find((child: any) => child.name === 'img');
        const figcaptionNode = node.children?.find((child: any) => child.name === 'figcaption');
        
        if (imgNode?.attribs?.src) {
          const width = imgNode.attribs.width || Dimensions.get('window').width - 32;
          const height = imgNode.attribs.height || width * 0.6;
          
          return (
            <View key={index} style={styles.figureContainer}>
              <Image
                source={{ uri: imgNode.attribs.src }}
                style={[styles.contentImage, { aspectRatio: width / height }]}
                resizeMode="contain"
              />
              {figcaptionNode && (
                <View style={styles.figcaption}>
                  <Text style={styles.figcaptionText}>
                    {'Photo by '}
                    {figcaptionNode.children.map((child: any, i: number) => {
                      if (child.name === 'a') {
                        return (
                          <Text 
                            key={i}
                            style={styles.figcaptionLink}
                            onPress={() => Linking.openURL(child.attribs.href)}
                          >
                            {child.children[0].data}
                          </Text>
                        );
                      }
                      return child.data || '';
                    })}
                  </Text>
                </View>
              )}
            </View>
          );
        }
        break;

      case 'a':
        return (
          <TouchableOpacity 
            key={index}
            onPress={() => Linking.openURL(node.attribs.href)}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              {node.children[0].data}
            </Text>
          </TouchableOpacity>
        );

      case 'p':
        return (
          <Text key={index} style={styles.paragraph}>
            {node.children.map((child: any, i: number) => {
              if (child.name === 'a') {
                return (
                  <TouchableOpacity 
                    key={i}
                    onPress={() => Linking.openURL(child.attribs.href)}
                    style={styles.inlineLinkContainer}
                  >
                    <Text style={styles.linkText}>
                      {child.children[0].data}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return child.data || '';
            })}
          </Text>
        );

      case 'img':
        const width = node.attribs.width || Dimensions.get('window').width - 32;
        const height = node.attribs.height || width * 0.6;
        
        return (
          <View key={index} style={styles.contentImageContainer}>
            <Image
              source={{ uri: node.attribs.src }}
              style={[styles.contentImage, { aspectRatio: width / height }]}
              resizeMode="contain"
            />
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {stripHtmlAndDecode(post.title.rendered)}
        </Text>
        
        <View style={styles.meta}>
          <Text style={styles.date}>
            {post.date ? new Date(post.date).toLocaleDateString() : ''}
          </Text>
          {post._embedded?.author?.[0]?.name && (
            <Text style={styles.author}>
              By {post._embedded.author[0].name}
            </Text>
          )}
        </View>
      </View>

      {imageUrl && (
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        <HTMLView
          value={processContent(post.content.rendered)}
          renderNode={renderNode}
          stylesheet={htmlStyles}
        />
      </View>
    </ScrollView>
  );
}

const htmlStyles = StyleSheet.create({
  div: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  p: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 0,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 0,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 0,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 0,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  featuredImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
    marginBottom: 24,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  contentImageContainer: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  figureContainer: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: undefined,
  },
  figcaption: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 0,
  },
  figcaptionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 0,
  },
  figcaptionLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontStyle: 'italic',
  },
  linkContainer: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  inlineLinkContainer: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 0,
  },
}); 