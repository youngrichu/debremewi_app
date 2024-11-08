import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

type BlogPostDetailProps = {
  route: {
    params: {
      post: {
        title: {
          rendered: string;
        };
        content: {
          rendered: string;
        };
      };
    };
  };
};

const BlogPostDetail = ({ route }: BlogPostDetailProps) => {
  const { post } = route.params;
  const [webViewHeight, setWebViewHeight] = useState(Dimensions.get('window').height);

  // Create HTML template with proper styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, system-ui;
            padding: 15px;
            margin: 0;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          p {
            line-height: 1.6;
            font-size: 16px;
          }
          h1, h2, h3, h4, h5, h6 {
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        ${post.content.rendered}
      </body>
    </html>
  `;

  const onWebViewMessage = (event: any) => {
    setWebViewHeight(Number(event.nativeEvent.data));
  };

  // Inject JavaScript to get content height
  const injectedJavaScript = `
    window.ReactNativeWebView.postMessage(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    );
    true;
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title.rendered}</Text>
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webView, { height: webViewHeight }]}
        originWhitelist={['*']}
        scrollEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={onWebViewMessage}
        showsVerticalScrollIndicator={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default BlogPostDetail; 