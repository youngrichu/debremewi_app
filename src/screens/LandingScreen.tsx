import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Text } from '../components/Text';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#2196F3', '#1976D2']}
      style={styles.container}
    >
      <View style={styles.languageContainer}>
        <LanguageSelector />
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {t('landing.welcome.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('landing.welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              {t('landing.buttons.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              {t('landing.buttons.register')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>
          {t('landing.footer.version', { version: Constants.expoConfig?.version })}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  languageContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 14,
  },
});
