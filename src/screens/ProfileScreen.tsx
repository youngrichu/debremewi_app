import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <View style={styles.container}>
      <Text>Profile</Text>
      <Text>Welcome, {user.name || 'Guest'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
