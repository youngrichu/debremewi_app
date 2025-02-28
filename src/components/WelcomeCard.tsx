import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.35; // 35% of screen height
const FONT_SCALE = SCREEN_WIDTH / 400; // Base scale factor

const WelcomeCard = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/church-background.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
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
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT,
    marginBottom: SCREEN_HEIGHT * 0.02, // 2% of screen height
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    margin: SCREEN_WIDTH * 0.04, // 4% of screen width
  },
  backgroundImageStyle: {
    borderRadius: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05, // 5% of screen width
  },
  welcomeTitle: {
    fontSize: Math.min(32 * FONT_SCALE, 40), // Scaled but capped at 40
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SCREEN_HEIGHT * 0.01,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    ...Platform.select({
      ios: {
        padding: 4, // Helps with text rendering on iOS
      },
    }),
  },
  churchSubtitle: {
    fontSize: Math.min(14 * FONT_SCALE, 18),
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  verseText: {
    fontSize: Math.min(16 * FONT_SCALE, 20),
    fontStyle: 'italic',
    color: '#FFF',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
  },
  verseReference: {
    fontSize: Math.min(14 * FONT_SCALE, 16),
    color: '#FFF',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default WelcomeCard; 