import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeCard = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.welcomeAmharic}>እንኳን ደህና መጣችሁ</Text>
          <Text style={styles.welcomeEnglish}>Welcome</Text>
          <Text style={styles.churchName}>Dubai Debre Mewi</Text>
          <Text style={styles.churchSubtitle}>
            St. Michael and St. Hripsime Ethiopian Orthodox Tewahedo Church
          </Text>
          <Text style={styles.verseText}>
            "This is the house of God. This is the gate of heaven."
          </Text>
          <Text style={styles.verseReference}>Genesis 28:17</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 340,
    marginBottom: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    margin: 16,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeAmharic: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  welcomeEnglish: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  churchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  churchSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  verseText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  verseReference: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default WelcomeCard; 