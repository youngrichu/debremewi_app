import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LandingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the App!</Text>
      <Text style={styles.infoText}>This is your landing page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default LandingScreen;
