import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text } from './Text';
import { useTranslation } from 'react-i18next';
import { getPickerConfig } from '../constants/options';

interface PickerOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomPickerProps {
  visible: boolean;
  onClose: () => void;
  pickerName: string;
  onSelect: (value: string) => void;
  selectedValue?: string;
  options?: PickerOption[];
  title?: string;
}

export function CustomPicker({ 
  visible, 
  onClose, 
  pickerName, 
  onSelect, 
  selectedValue,
  options: customOptions,
  title: customTitle 
}: CustomPickerProps) {
  const { t } = useTranslation();
  
  const defaultOptions = getPickerConfig(pickerName as any)?.options || [];
  const options = customOptions || defaultOptions;

  const getPickerTitle = () => {
    if (customTitle) return customTitle;
    
    switch (pickerName) {
      case 'serviceAtParish':
        return t('profile.selects.selectServiceType');
      case 'ministryService':
        return t('profile.selects.selectMinistryService');
      case 'christianLife':
        return t('profile.selects.selectChristianLife');
      case 'residencyCity':
        return t('profile.selects.selectCity');
      case 'hasFatherConfessor':
        return t('profile.fields.hasFatherConfessor');
      case 'hasAssociationMembership':
        return t('profile.fields.hasAssociationMembership');
      case 'residencePermit':
        return t('profile.selects.selectResidencePermit');
      case 'gender':
        return t('profile.selects.selectGender');
      case 'maritalStatus':
        return t('profile.selects.selectMaritalStatus');
      case 'educationLevel':
        return t('profile.selects.selectEducationLevel');
      case 'hasChildren':
        return t('profile.fields.hasChildren');
      default:
        return t('common.select');
    }
  };

  const getTranslatedOption = (option: string | PickerOption) => {
    if (typeof option === 'object') {
      return option.label;
    }

    if (['hasFatherConfessor', 'hasAssociationMembership', 'residencePermit'].includes(pickerName)) {
      return t(`common.${option.toLowerCase()}`);
    }
    if (option === 'none') {
      return t('common.none');
    }
    if (pickerName === 'residencyCity') {
      return t(`profile.options.cities.${option}`);
    }
    return t(`profile.options.${pickerName}.${option}`);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{getPickerTitle()}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.optionsList}>
            {options.map((option) => {
              const isObject = typeof option === 'object';
              if (isObject && option.disabled) return null;
              
              const value = isObject ? option.value : option;
              const isSelected = selectedValue === value;

              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => {
                    onSelect(value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}
                  >
                    {getTranslatedOption(option)}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  optionsList: {
    padding: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#F5F9FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkmark: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 