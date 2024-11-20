import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { changeLanguage } from '../i18n';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = async (lang: string) => {
    try {
      console.log('Changing language to:', lang);
      const success = await changeLanguage(lang);
      if (success) {
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguageDisplay = () => {
    const currentLanguage = i18n.language;
    // Show the opposite language code of what's currently selected
    return currentLanguage === 'en' ? 'አማ' : 'EN';
  };

  const getLanguageStyle = (language: string, isButton: boolean = false) => {
    if (isButton) {
      // Style for modal buttons
      return {
        backgroundColor: i18n.language === language ? '#f0f0f0' : 'transparent',
        color: '#333333'
      };
    }
    // Style for circular indicator
    if (language === 'en') {
      return {
        backgroundColor: '#2196F3', // Primary blue color
        color: '#ffffff'
      };
    }
    return {
      backgroundColor: '#2196F3', // Primary blue color
      color: '#ffffff'
    };
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={styles.container}
      >
        <View style={[
          styles.flagButton,
          getLanguageStyle(i18n.language)
        ]}>
          <Text style={[
            styles.languageText,
            { color: getLanguageStyle(i18n.language).color }
          ]}>
            {getCurrentLanguageDisplay()}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={[
                styles.languageOption,
                getLanguageStyle('en', true),
                i18n.language === 'en' && styles.selectedOption
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageOptionText,
                i18n.language === 'en' && styles.selectedText
              ]}>
                English
              </Text>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color="#2196F3" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.languageOption,
                getLanguageStyle('am', true),
                i18n.language === 'am' && styles.selectedOption
              ]}
              onPress={() => handleLanguageChange('am')}
            >
              <Text style={[
                styles.languageOptionText,
                i18n.language === 'am' && styles.selectedText
              ]}>
                አማርኛ
              </Text>
              {i18n.language === 'am' && (
                <Ionicons name="checkmark" size={20} color="#2196F3" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  flagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  languageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  languageOption: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  selectedText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  }
});