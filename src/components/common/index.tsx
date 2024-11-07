import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <Text>Loading...</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default { LoadingIndicator };
