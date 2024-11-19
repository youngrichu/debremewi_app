import React, { useState, useCallback, memo } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, Dimensions, ActivityIndicator, Linking, Share, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Post } from '../types';
import RenderHTML, { 
  HTMLElementModel,
  HTMLContentModel,
  CustomRendererProps,
  TRenderEngineConfig,
  TNode
} from 'react-native-render-html';
import ImageView from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'html-entities';
import { useTranslation } from 'react-i18next';

interface BlogPostDetailProps {
  route: {
    params: {
      post: Post;
    };
  };
}

interface CustomFigureProps extends CustomRendererProps<TRenderEngineConfig> {
  onImagePress: (url: string) => void;
}

const CustomFigureRenderer = memo(({ TDefaultRenderer, tnode, onImagePress, ...props }: CustomFigureProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);

  const imgElement = tnode.children?.find(
    (child: TNode) => child.tagName === 'img'
  );
  
  if (!imgElement) return null;

  const imgSrc = imgElement.attributes.src;
  const imgAlt = imgElement.attributes.alt || '';
  const caption = tnode.children?.find(
    (child: TNode) => child.tagName === 'figcaption'
  );
  
  const imgWidth = parseInt(imgElement.attributes.width) || width - 32;
  const imgHeight = parseInt(imgElement.attributes.height) || imgWidth * 0.75;
  const aspectRatio = imgWidth / imgHeight;
  
  return (
    <View style={styles.figureContainer}>
      <TouchableOpacity 
        onPress={() => onImagePress(imgSrc)}
        style={styles.imageWrapper}
      >
        <Image
          source={{ uri: imgSrc }}
          style={[
            styles.contentImage,
            {
              width: width - 32,
              height: (width - 32) / aspectRatio,
            }
          ]}
          resizeMode="cover"
          accessibilityLabel={imgAlt}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
        {isLoading && (
          <ActivityIndicator 
            style={styles.imageLoader}
            size="large"
            color="#2196F3"
          />
        )}
      </TouchableOpacity>
      {caption && (
        <View style={styles.figcaption}>
          <TDefaultRenderer tnode={caption} {...props} />
        </View>
      )}
    </View>
  );
});

export default function BlogPostDetail({ route }: BlogPostDetailProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { post } = route.params;
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const stripHtmlAndDecode = (html: string): string => {
    if (!html) return '';
    return decode(html.replace(/<[^>]*>/g, ''));
  };

  const handleShare = async () => {
    try {
      const title = stripHtmlAndDecode(post.title.rendered);
      await Share.share({
        message: t('blog.detail.share.message', { title }) + '\n\n' + post.link,
        title: title,
        url: post.link,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImagePress = useCallback((imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewVisible(true);
  }, []);

  const renderFigure = useCallback((props: CustomRendererProps<TRenderEngineConfig>) => (
    <CustomFigureRenderer {...props} onImagePress={handleImagePress} />
  ), [handleImagePress]);

  const renderers = {
    figure: renderFigure
  };

  const customHTMLElementModels = {
    figure: HTMLElementModel.fromCustomModel({
      tagName: 'figure',
      contentModel: HTMLContentModel.block,
      isVoid: false,
      renderDirection: 'ltr',
    })
  };

  const tagsStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    },
    figure: {
      margin: 0,
      padding: 0,
    },
    figcaption: {
      fontSize: 14,
      color: '#666',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 8,
      backgroundColor: '#f9f9f9',
    },
    a: {
      color: '#2196F3',
      textDecorationLine: 'underline',
    },
    p: {
      marginVertical: 8,
    },
    img: {
      marginVertical: 8,
    },
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {stripHtmlAndDecode(post.title.rendered)}
          </Text>
          
          <View style={styles.meta}>
            <Text style={styles.date}>
              {post.date ? new Date(post.date).toLocaleDateString() : ''}
            </Text>
            <View style={styles.metaRight}>
              {post._embedded?.author?.[0]?.name && (
                <Text style={styles.author}>
                  {t('blog.detail.postedBy', { author: post._embedded.author[0].name })}
                </Text>
              )}
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Ionicons name="share-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <RenderHTML
            contentWidth={width}
            source={{ html: post.content.rendered }}
            renderers={renderers}
            customHTMLElementModels={customHTMLElementModels}
            tagsStyles={tagsStyles}
            enableExperimentalBRCollapsing
            enableExperimentalMarginCollapsing
          />
        </View>
      </ScrollView>

      <ImageView
        images={[{ uri: selectedImageUrl }]}
        imageIndex={0}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
      />
    </>
  );
}

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
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginLeft: 16,
    padding: 4,
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
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  contentImage: {
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  figcaption: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  scrollContent: {
    flexGrow: 1,
  },
});