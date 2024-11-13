import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import am from './locales/am.json';

const resources = {
  en: { translation: en },
  am: { translation: am }
};

// Export a promise that resolves when i18n is initialized
export const i18nInit = (async () => {
  try {
    console.log('Initializing i18n...');
    console.log('Device locale:', Localization.locale);
    
    let savedLanguage = await AsyncStorage.getItem('language');
    console.log('Saved language from storage:', savedLanguage);
    
    if (!savedLanguage) {
      const deviceLang = Localization.locale.split('-')[0];
      savedLanguage = ['en', 'am'].includes(deviceLang) ? deviceLang : 'en';
      console.log('Using default language:', savedLanguage);
      await AsyncStorage.setItem('language', savedLanguage);
    }

    await i18next
      .use(initReactI18next)
      .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        compatibilityJSON: 'v3',
      });

    console.log('i18n initialized with language:', i18next.language);
    
    // Add a language change listener
    i18next.on('languageChanged', (lng) => {
      console.log('Language changed event:', lng);
    });

    return i18next;
  } catch (error) {
    console.error('Error initializing i18n:', error);
    throw error;
  }
})();

// Export a function to change the language
export const changeLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem('language', lang);
    await i18next.changeLanguage(lang);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

export default i18next; 