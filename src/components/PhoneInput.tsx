import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChangePhoneNumber: (phoneNumber: string, countryCode: string) => void;
  error?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next';
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>((props, ref) => {
  const {
    value,
    countryCode,
    onChangePhoneNumber,
    error,
    onSubmitEditing,
    returnKeyType = 'next'
  } = props;

  const formatPhoneNumber = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    // Format based on UAE phone number pattern (XX XXX XXXX)
    if (countryCode === '+971') {
      if (cleaned.length > 2) {
        formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
      }
      if (cleaned.length > 5) {
        formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6);
      }
    }

    return formatted;
  };

  const handleChangeText = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    onChangePhoneNumber(formattedNumber, countryCode);
  };

  const handleCountryCodeChange = (text: string) => {
    // Ensure the country code always starts with +
    let newCode = text;
    if (text && !text.startsWith('+')) {
      newCode = '+' + text;
    }
    onChangePhoneNumber(value, newCode);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.countryCodeInput, error && styles.inputError]}
        value={countryCode}
        onChangeText={handleCountryCodeChange}
        keyboardType="phone-pad"
        placeholder="+971"
        maxLength={4}
      />

      <TextInput
        ref={ref}
        style={[
          styles.input,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="phone-pad"
        placeholder="XX XXX XXXX"
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        maxLength={11} // 2 + 3 + 4 digits + 2 spaces
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  countryCodeInput: {
    width: 70,
    height: Platform.OS === 'ios' ? 40 : undefined,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: Platform.OS === 'ios' ? 40 : undefined,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
});
