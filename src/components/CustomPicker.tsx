import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomPickerProps {
  visible: boolean;
  onClose: () => void;
  options: Option[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  title: string;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  visible,
  onClose,
  options = [],
  onSelect,
  selectedValue,
  title
}) => {
  if (!options) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      selectedValue === option.value && styles.selectedOption,
                      option.disabled && styles.disabledOption
                    ]}
                    onPress={() => {
                      if (!option.disabled) {
                        onSelect(option.value);
                        onClose();
                      }
                    }}
                    disabled={option.disabled}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedValue === option.value && styles.selectedOptionText,
                      option.disabled && styles.disabledOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {selectedValue === option.value && !option.disabled && (
                      <Ionicons name="checkmark" size={24} color="#2196F3" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  selectedOption: {
    backgroundColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  disabledOption: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  disabledOptionText: {
    color: '#999',
    fontStyle: 'italic',
  },
}); 