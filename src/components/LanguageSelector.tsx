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

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={styles.iconButton}
      >
        <Ionicons name="language" size={24} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={[styles.languageOption, i18n.language === 'en' && styles.selectedOption]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageText, i18n.language === 'en' && styles.selectedText]}>
                🇺🇸 English
              </Text>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color="#2196F3" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.languageOption, i18n.language === 'am' && styles.selectedOption]}
              onPress={() => handleLanguageChange('am')}
            >
              <Text style={[styles.languageText, i18n.language === 'am' && styles.selectedText]}>
                🇪🇹 አማርኛ
              </Text>
              {i18n.language === 'am' && (
                <Ionicons name="checkmark" size={20} color="#2196F3" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#F5F9FF',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#2196F3',
    fontWeight: '600',
  },
}); 