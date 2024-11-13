import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const WelcomeCard = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>{t('home.welcome.title')}</Text>
          <Text style={styles.churchSubtitle}>
            {t('home.welcome.subtitle')}
          </Text>
          <Text style={styles.verseText}>
            {t('home.welcome.verse.text')}
          </Text>
          <Text style={styles.verseReference}>
            {t('home.welcome.verse.reference')}
          </Text>
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
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
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